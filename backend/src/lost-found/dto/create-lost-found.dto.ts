import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { LostFoundType } from '../entities/lost-found-item.entity';

export class CreateLostFoundDto {
  @IsEnum(LostFoundType)
  @IsNotEmpty()
  type: LostFoundType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  divisionName?: string;

  @IsOptional()
  @IsString()
  districtName?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber()
  rewardAmount?: number;

  @IsOptional()
  images?: string[];
}
