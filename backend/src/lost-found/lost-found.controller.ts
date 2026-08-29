import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
import { LostFoundService } from './lost-found.service';
import { CreateLostFoundDto } from './dto/create-lost-found.dto';
import { ClaimLostFoundDto, UpdateLostFoundStatusDto } from './dto/claim-lost-found.dto';
import { LostFoundStatus, LostFoundType } from './entities/lost-found-item.entity';

@Controller('lost-found')
export class LostFoundController {
  constructor(private readonly service: LostFoundService) {}

  @Public()
  @Get()
  findAll(
    @Query('type') type?: LostFoundType,
    @Query('category') category?: string,
    @Query('status') status?: LostFoundStatus,
    @Query('divisionName') divisionName?: string,
    @Query('q') q?: string,
  ) {
    return this.service.findAll({ type, category, status, divisionName, q });
  }

  @UseGuards(JwtAuthGuard)
  @Post('new')
  @UseInterceptors(FilesInterceptor('images', 8, multerConfig))
  create(
    @Body() dto: CreateLostFoundDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: RequestWithUser,
  ) {
    return this.service.create(dto, files || [], req.user);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CITIZEN)
  @Put(':id/claim')
  claimItemPut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClaimLostFoundDto,
    @Request() req: RequestWithUser,
  ) {
    return this.service.claimItem(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CITIZEN)
  @Post(':id/claim')
  claimItemPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClaimLostFoundDto,
    @Request() req: RequestWithUser,
  ) {
    return this.service.claimItem(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHORITY, Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLostFoundStatusDto,
    @Request() req: RequestWithUser,
  ) {
    return this.service.updateStatus(id, dto, req.user);
  }
}
