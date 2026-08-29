import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/public.decorator';
import type { RequestWithUser } from '../common/types/request-with-user.type';
import { AssignReportDto } from './dto/assign-report.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Citizens only - Authority & Admin perform review and approval
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @Post()
  create(
    @Body() createReportDto: CreateReportDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.create(createReportDto, req.user);
  }

  // Admin, Authority can see all reports
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHORITY)
  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.reportsService.findAll(req.user);
  }

  // Any authenticated user can see public civic reports
  @Public()
  @Get('public')
  findPublicReports(@Request() req: RequestWithUser) {
    return this.reportsService.findPublicReports(req.user);
  }

  // IoT Simulation Webhook
  @Public()
  @Post('iot/webhook')
  handleIotWebhook(@Body() payload: any) {
    return this.reportsService.handleIotWebhook(payload);
  }

  // Any authenticated user can see their own reports
  @Get('my')
  findMyReports(@Request() req: RequestWithUser) {
    return this.reportsService.findMyReports(req.user);
  }

  // Officers only
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @Get('assigned/my')
  findAssignedReports(@Request() req: RequestWithUser) {
    return this.reportsService.findAssignedReports(req.user);
  }

  // Any authenticated user can view a single report
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.findOne(id, req.user);
  }

  // Admin or Authority can assign reports
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHORITY)
  @Patch(':id/assign')
  assignReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignReportDto: AssignReportDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.assignReport(
      id,
      assignReportDto.officerId,
      req.user,
    );
  }

  // Creator or Admin can update a report
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.update(id, updateReportDto, req.user);
  }

  // Admin, Authority, or assigned Officer can update status
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.updateStatus(id, updateStatusDto, req.user);
  }

  // Admin or Creator (if submitted) can delete a report
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.remove(id, req.user);
  }

  // Any authenticated user can add a comment (if they have access to the report)
  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() addCommentDto: AddCommentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.addComment(id, addCommentDto, req.user);
  }

  // Any authenticated user can upvote a public civic report
  @Post(':id/upvote')
  toggleUpvote(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.toggleUpvote(id, req.user);
  }

  @Post(':id/request-update')
  requestUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.requestUpdate(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUTHORITY)
  @Post(':id/allow-update')
  allowUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.reportsService.allowUpdate(id, req.user);
  }
}
