import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get('ping')
  async ping() {
    return { status: 'ok', time: new Date().toISOString() };
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productService.findAll(+page || 1, +limit || 10, categoryId);
  }

  @Get(':id/detail')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Post(':id/skus')
  async updateSkus(@Param('id') id: string, @Body('skus') skus: any[]) {
    return this.productService.updateSkus(id, skus);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    console.log('[Import] Received request');
    if (!file) {
      console.error('[Import] No file received in Multer');
      throw new Error('未接收到文件，请检查字段名是否为 file');
    }
    console.log(`[Import] File details: ${file.originalname}, size: ${file.size}`);
    return this.productService.importProducts(file.buffer);
  }

  @Get('export')
  async exportProducts(@Res() res: Response) {
    return this.productService.exportProducts(res);
  }
}
