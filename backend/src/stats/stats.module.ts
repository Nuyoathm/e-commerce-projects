import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { Sku, SkuSchema } from '../sku/schemas/sku.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Sku.name, schema: SkuSchema },
        ]),
    ],
    controllers: [StatsController],
    providers: [StatsService],
})
export class StatsModule { }
