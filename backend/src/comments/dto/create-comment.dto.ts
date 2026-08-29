import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUniversalCommentDto {
  @IsString()
  @IsNotEmpty()
  targetType: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  targetId: number;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsString()
  guestAuthorName?: string;
}
