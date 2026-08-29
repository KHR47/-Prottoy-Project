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
import { ServicesService } from './services.service';
import { CreateServiceDto, CreateServiceReviewDto } from './dto/create-service.dto';
import { ServiceStatus } from './entities/service-listing.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Public()
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('divisionName') divisionName?: string,
    @Query('status') status?: ServiceStatus,
    @Query('q') q?: string,
  ) {
    return this.service.findAll({ category, divisionName, status, q });
  }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  create(
    @Body() dto: CreateServiceDto,
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
    @Body() body: { status: ServiceStatus; notes?: string },
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
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateServiceReviewDto,
    @Request() req?: RequestWithUser,
  ) {
    return this.service.addReview(id, dto, req?.user);
  }
}
