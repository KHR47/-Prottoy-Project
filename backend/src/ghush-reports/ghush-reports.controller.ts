import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';
import type { RequestWithUser } from '../common/types/request-with-user.type';
import { multerConfig } from '../documents/multer.config';
import { GhushReportsService } from './ghush-reports.service';
import { CreateGhushReportDto } from './dto/create-ghush-report.dto';
import { VerifyGhushReportDto } from './dto/verify-ghush-report.dto';
import { GhushReportStatus } from './entities/ghush-report.entity';

@Controller('ghush-reports')
export class GhushReportsController {
  constructor(private readonly ghushReportsService: GhushReportsService) {}

  @Public()
  @Get('stats')
  getStats() {
    return this.ghushReportsService.getStats();
  }

  @Public()
  @Get()
  findAll(
    @Query('status') status?: GhushReportStatus,
    @Query('department') department?: string,
    @Query('divisionName') divisionName?: string,
    @Query('myReports') myReports?: string,
    @Request() req?: RequestWithUser,
  ) {
    return this.ghushReportsService.findAll(
      {
        status,
        department,
        divisionName,
        myReports: myReports === 'true',
      },
      req?.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  @UseInterceptors(FilesInterceptor('evidence', 10, multerConfig))
  create(
    @Body() createDto: CreateGhushReportDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUser,
  ) {
    return this.ghushReportsService.create(createDto, files || [], req.user);
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req?: RequestWithUser,
  ) {
    return this.ghushReportsService.findOne(id, req?.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHORITY, Role.OFFICER)
  @Patch(':id/verify')
  @Post(':id/verify')
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body() verifyDto: VerifyGhushReportDto,
    @Request() req: RequestWithUser,
  ) {
    return this.ghushReportsService.verify(id, verifyDto, req.user);
  }
}
