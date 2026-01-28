import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) { }

  async uploadImage(file: Express.Multer.File) {
    const port = this.configService.get('PORT') || 3000;
    // For local dev, we assume the server is on localhost
    // In production, this should be the domain
    const url = `http://localhost:${port}/uploads/${file.filename}`;
    return {
      url,
      filename: file.filename,
      originalname: file.originalname,
    };
  }

  async uploadFile(file: Express.Multer.File) {
    const port = this.configService.get('PORT') || 3000;
    const url = `http://localhost:${port}/uploads/${file.filename}`;
    return {
      url,
      filename: file.filename,
      originalname: file.originalname,
    };
  }
}
