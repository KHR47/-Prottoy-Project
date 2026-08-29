import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GhushReportStatus } from '../entities/ghush-report.entity';

export class VerifyGhushReportDto {
  @IsEnum(GhushReportStatus)
  @IsNotEmpty()
  status: GhushReportStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
