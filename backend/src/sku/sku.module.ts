import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkuController } from './sku.controller';
import { SkuService } from './sku.service';
import { Sku, SkuSchema } from './schemas/sku.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sku.name, schema: SkuSchema },
    ]),
  ],
  controllers: [SkuController],
  providers: [SkuService],
  exports: [SkuService],
})
export class SkuModule {}
