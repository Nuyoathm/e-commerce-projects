import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockMovementDto } from './dto/stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Post('in')
  inStock(@Body() dto: StockMovementDto, @Req() req: any) {
    const operatorId = req.user.userId;
    return this.stockService.inStock(dto, operatorId);
  }

  @Post('out')
  outStock(@Body() dto: StockMovementDto, @Req() req: any) {
    const operatorId = req.user.userId;
    return this.stockService.outStock(dto, operatorId);
  }

  @Get('records')
  findRecords(@Query('page') page: string, @Query('limit') limit: string) {
    return this.stockService.findRecords(+page || 1, +limit || 20);
  }
}
