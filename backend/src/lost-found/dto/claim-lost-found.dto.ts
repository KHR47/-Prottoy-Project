import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LostFoundStatus } from '../entities/lost-found-item.entity';

export class ClaimLostFoundDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateLostFoundStatusDto {
  @IsEnum(LostFoundStatus)
  @IsNotEmpty()
  status: LostFoundStatus;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
