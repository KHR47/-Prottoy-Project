import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ParkingLot } from './parking-lot.entity';
import { Booking } from './booking.entity';

export enum SlotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

export enum SlotType {
  CAR = 'car',
  BIKE = 'bike',
  EV = 'ev',
  HANDICAP = 'handicap',
}

@Entity('parking_slots')
@Index(['status'])
export class ParkingSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slotNumber: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  zone: string;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status: SlotStatus;

  @Column({ type: 'enum', enum: SlotType, default: SlotType.CAR })
  type: SlotType;

  @ManyToOne(() => ParkingLot, (lot) => lot.slots, { onDelete: 'CASCADE' })
  parkingLot: ParkingLot;

  @OneToMany(() => Booking, (booking) => booking.parkingSlot)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
