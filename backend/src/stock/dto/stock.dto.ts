import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class StockMovementDto {
    @IsString()
    @IsNotEmpty()
    skuId: string;

    @IsNumber()
    @Min(1)
    qty: number;

    @IsString()
    @IsOptional()
    remark?: string;
}
