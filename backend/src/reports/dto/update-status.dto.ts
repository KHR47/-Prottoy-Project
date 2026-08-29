import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from '../../common/enums/report-status.enum';

export class UpdateStatusDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
