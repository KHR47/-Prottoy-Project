import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHousingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  rent: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsString()
  rentType?: string;

  @IsOptional()
  @IsString()
  divisionName?: string;

  @IsOptional()
  @IsString()
  districtName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  images?: string[];
}

export class CreateHousingReviewDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  images?: string[];
}
