import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SkuService } from './sku.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sku')
@UseGuards(JwtAuthGuard)
export class SkuController {
  constructor(private readonly skuService: SkuService) { }

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('skuCode') skuCode?: string,
  ) {
    return this.skuService.findAll(+page || 1, +limit || 20, skuCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skuService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSkuDto: any) {
    return this.skuService.update(id, updateSkuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skuService.remove(id);
  }
}
