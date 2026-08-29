import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { ParkingService } from './parking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Role } from '../common/enums/role.enum';
import { SlotStatus } from './entities/parking-slot.entity';
import { ViolationStatus } from './entities/violation.entity';

@Controller('parking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  // ────────────────────────────────────────────────────────────────────────────
  // CITIZEN — Find & Browse
  // ────────────────────────────────────────────────────────────────────────────

  @Public()
  @Get('lots')
  findAllLots() {
    return this.parkingService.findAllLots();
  }

  @Public()
  @Get('lots/:id')
  findLot(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.findLotById(id);
  }

  @Public()
  @Get('lots/:id/slots')
  findSlotsByLot(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.findSlotsByLot(id);
  }

  @Public()
  @Get('slots/:id')
  findSlot(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.findSlotById(id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CITIZEN — Vehicles
  // ────────────────────────────────────────────────────────────────────────────

  @Get('my-vehicles')
  @Roles(Role.CITIZEN)
  getMyVehicles(@Request() req) {
    return this.parkingService.getUserVehicles(req.user.id);
  }

  @Post('vehicles')
  @Roles(Role.CITIZEN)
  registerVehicle(@Request() req, @Body() data: any) {
    return this.parkingService.registerVehicle(req.user.id, data);
  }

  @Delete('vehicles/:id')
  @Roles(Role.CITIZEN)
  deleteVehicle(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.parkingService.deleteVehicle(id, req.user.id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CITIZEN — Bookings
  // ────────────────────────────────────────────────────────────────────────────

  @Post('book')
  @Roles(Role.CITIZEN)
  createBooking(@Request() req, @Body() data: any) {
    return this.parkingService.createBooking(req.user.id, data);
  }

  @Get('my-bookings')
  @Roles(Role.CITIZEN)
  getMyBookings(@Request() req) {
    return this.parkingService.getUserBookings(req.user.id);
  }

  @Post('bookings/:id/cancel')
  @Roles(Role.CITIZEN)
  cancelMyBooking(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.parkingService.cancelBooking(id, req.user.id);
  }

  @Post('bookings/:id/pay')
  @Roles(Role.CITIZEN)
  payBooking(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.parkingService.payBooking(id, req.user.id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CITIZEN — Violations
  // ────────────────────────────────────────────────────────────────────────────

  @Get('my-violations')
  @Roles(Role.CITIZEN)
  getMyViolations(@Request() req) {
    return this.parkingService.getUserViolations(req.user.id);
  }

  @Post('violations/:id/pay')
  @Roles(Role.CITIZEN)
  payViolation(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.parkingService.payViolation(id, req.user.id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ATTENDANT — On-Ground Operations
  // ────────────────────────────────────────────────────────────────────────────

  @Get('attendant/active-bookings')
  @Roles(Role.ATTENDANT, Role.AUTHORITY, Role.ADMIN)
  getActiveBookings() {
    return this.parkingService.getAttendantActiveBookings();
  }

  @Post('check-in/:id')
  @Roles(Role.ATTENDANT, Role.AUTHORITY, Role.ADMIN)
  checkIn(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.checkIn(id);
  }

  @Post('check-out/:id')
  @Roles(Role.ATTENDANT, Role.AUTHORITY, Role.ADMIN)
  checkOut(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.checkOut(id);
  }

  @Patch('slots/:id/status')
  @Roles(Role.ATTENDANT, Role.AUTHORITY, Role.ADMIN)
  updateSlotStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: SlotStatus,
  ) {
    return this.parkingService.updateSlotStatus(id, status);
  }

  @Post('violations')
  @Roles(Role.ATTENDANT, Role.AUTHORITY, Role.ADMIN)
  issueViolation(@Request() req, @Body() data: any) {
    return this.parkingService.createViolation(req.user.id, data);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // OPERATOR (AUTHORITY) — Management
  // ────────────────────────────────────────────────────────────────────────────

  @Get('operator/analytics')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  getAnalytics() {
    return this.parkingService.getOperatorAnalytics();
  }

  @Get('operator/bookings')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  getAllBookings() {
    return this.parkingService.getAllBookings();
  }

  @Get('operator/bookings/:id')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  getBookingById(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.getBookingById(id);
  }

  @Post('operator/bookings/:id/cancel')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  cancelBooking(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.cancelBooking(id);
  }

  @Get('operator/violations')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  getAllViolations() {
    return this.parkingService.getAllViolations();
  }

  @Patch('operator/violations/:id')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  resolveViolation(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: ViolationStatus; notes?: string },
  ) {
    return this.parkingService.resolveViolation(id, data);
  }

  @Get('operator/payments')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  getPaymentSummary() {
    return this.parkingService.getPaymentSummary();
  }

  // Lot CRUD (Operator)
  @Get('operator/lots')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  getAllLotsAdmin() {
    return this.parkingService.findAllLotsAdmin();
  }

  @Post('lots')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  createLot(@Body() data: any) {
    return this.parkingService.createLot(data);
  }

  @Patch('lots/:id')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  updateLot(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.parkingService.updateLot(id, data);
  }

  @Delete('lots/:id')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  deleteLot(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.deleteLot(id);
  }

  // Slot CRUD (Operator)
  @Post('lots/:id/slots')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  createSlot(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.parkingService.createSlot(id, data);
  }

  @Post('lots/:id/slots/bulk')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  bulkCreateSlots(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.parkingService.bulkCreateSlots(id, data);
  }

  @Delete('slots/:id')
  @Roles(Role.AUTHORITY, Role.ADMIN)
  deleteSlot(@Param('id', ParseIntPipe) id: number) {
    return this.parkingService.deleteSlot(id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ADMIN — Global Analytics
  // ────────────────────────────────────────────────────────────────────────────

  @Get('admin/analytics')
  @Roles(Role.ADMIN)
  getAdminAnalytics() {
    return this.parkingService.getOperatorAnalytics();
  }
}
