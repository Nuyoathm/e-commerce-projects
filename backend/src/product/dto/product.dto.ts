import { IsString, IsArray, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    images?: string[];

    @IsString()
    @IsOptional()
    descRichText?: string;

    @IsArray()
    @IsOptional()
    specs?: any[];

    @IsNumber()
    @IsOptional()
    status?: number;

    @IsArray()
    @IsOptional()
    skus?: any[]; // For initial creation
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    images?: string[];

    @IsString()
    @IsOptional()
    descRichText?: string;

    @IsArray()
    @IsOptional()
    specs?: any[];

    @IsNumber()
    @IsOptional()
    status?: number;

    @IsArray()
    @IsOptional()
    skus?: any[];
}
