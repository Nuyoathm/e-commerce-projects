import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResultCode } from '../constants/result-code';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;

    const msg = typeof exceptionResponse === 'object'
      ? (exceptionResponse as any).message || (exceptionResponse as any).error
      : exceptionResponse || (exception as any).message || 'Internal server error';

    const code = exception instanceof HttpException ? status : ResultCode.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      code,
      msg: Array.isArray(msg) ? msg[0] : msg,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(`[${request.method}] ${request.url} - Status: ${status}`);
      console.error(exception); // Log full stack trace to console
    }

    response.status(status).json(errorResponse);
  }
}
