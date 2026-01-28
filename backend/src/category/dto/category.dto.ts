import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    parentId?: string | null;

    @IsNumber()
    @IsOptional()
    sort?: number;

    @IsNumber()
    @IsOptional()
    status?: number;
}

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    parentId?: string | null;

    @IsNumber()
    @IsOptional()
    sort?: number;

    @IsNumber()
    @IsOptional()
    status?: number;
}
