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
import { HousingService } from './housing.service';
import { CreateHousingDto, CreateHousingReviewDto } from './dto/create-housing.dto';
import { HousingStatus } from './entities/housing-listing.entity';

@Controller('housing')
export class HousingController {
  constructor(private readonly service: HousingService) {}

  @Public()
  @Get()
  findAll(
    @Query('minRent') minRent?: number,
    @Query('maxRent') maxRent?: number,
    @Query('rooms') rooms?: number,
    @Query('divisionName') divisionName?: string,
    @Query('status') status?: HousingStatus,
    @Query('q') q?: string,
  ) {
    return this.service.findAll({ minRent, maxRent, rooms, divisionName, status, q });
  }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  @UseInterceptors(FilesInterceptor('images', 8, multerConfig))
  create(
    @Body() dto: CreateHousingDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUser,
  ) {
    return this.service.create(dto, files || [], req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHORITY, Role.ADMIN)
  @Patch(':id/moderate')
  moderate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: HousingStatus; notes?: string },
  ) {
    return this.service.moderate(id, body.status, body.notes);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Public()
  @Post(':id/reviews')
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateHousingReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req?: RequestWithUser,
  ) {
    return this.service.addReview(id, dto, files || [], req?.user);
  }
}
