/**
 * Fresh Database Reset & Seeding Script
 * 
 * Clears all dynamic test data and recreates fresh standard role accounts:
 * - admin@test.com     / admin123     (Admin)
 * - authority@test.com / auth123      (Authority)
 * - officer@test.com   / officer123   (Officer)
 * - citizen@test.com   / citizen123   (Citizen)
 * - driver@test.com    / driver123    (Driver)
 * - attendant@test.com / attendant123 (Attendant)
 * 
 * Run with: npx ts-node src/reset-fresh.ts
 */

import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'asd123',
  database: process.env.DATABASE_NAME || 'smart_city_db',
  entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
  synchronize: true,
});

async function resetFresh() {
  console.log('🔄 Initializing database connection...');
  await AppDataSource.initialize();
  console.log('✅ Connected to database: ' + (process.env.DATABASE_NAME || 'smart_city_db'));

  // 1. Truncate dynamic tables cleanly with CASCADE
  console.log('🧹 Clearing all dynamic user and incident records...');

  const tablesToTruncate = [
    'universal_votes',
    'universal_comments',
    'service_reviews',
    'service_listings',
    'housing_reviews',
    'housing_listings',
    'lost_found_items',
    'ghush_report_evidence',
    'ghush_reports',
    'violations',
    'bookings',
    'vehicles',
    'parking_slots',
    'parking_lots',
    'report_supports',
    'status_history',
    'comments',
    'reports',
    'notifications',
    'documents',
    'water_meters',
    'gas_meters',
    'electricity_meters',
    'users',
  ];

  for (const table of tablesToTruncate) {
    try {
      await AppDataSource.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
      console.log(`   ✓ Cleared table: ${table}`);
    } catch (e: any) {
      // Table might not exist yet if fresh, catch and continue
      console.log(`   ℹ Table ${table} not found or skipped (${e.message})`);
    }
  }

  // 2. Seed Standard Roles
  console.log('\n👑 Seeding clean standard role accounts...');

  const standardRoles = [
    {
      name: 'Admin Controller',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin',
      district: 'Dhaka',
    },
    {
      name: 'City Authority',
      email: 'authority@test.com',
      password: '123456',
      role: 'authority',
      district: 'Dhaka',
    },
    {
      name: 'Integrity Officer',
      email: 'officer@test.com',
      password: 'officer123',
      role: 'officer',
      badgeNumber: 'B-001',
      district: 'Dhaka',
    },
    {
      name: 'Citizen Explorer',
      email: 'citizen@test.com',
      password: 'citizen123',
      role: 'citizen',
      district: 'Dhaka',
    },
    {
      name: 'Transit Driver',
      email: 'driver@test.com',
      password: 'driver123',
      role: 'driver',
      district: 'Dhaka',
    },
    {
      name: 'Parking Attendant',
      email: 'attendant@test.com',
      password: 'attendant123',
      role: 'attendant',
      district: 'Dhaka',
    },
  ];

  for (const u of standardRoles) {
    const hashed = await bcrypt.hash(u.password, 10);
    await AppDataSource.query(
      `INSERT INTO users (name, email, password, role, "badgeNumber", district, "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, true);`,
      [u.name, u.email, hashed, u.role, u.badgeNumber ?? null, u.district],
    );
    console.log(`   ✓ [${u.role.toUpperCase()}] ${u.email} (password: ${u.password})`);
  }

  // 3. Seed Incident Categories
  console.log('\n📂 Ensuring clean incident categories...');
  const categoriesCount = await AppDataSource.query(`SELECT COUNT(*) as count FROM categories;`);
  if (parseInt(categoriesCount[0]?.count || '0', 10) === 0) {
    const categories = [
      { name: 'Road Hazards & Potholes', type: 'civic', description: 'Damaged roads, potholes, open manholes' },
      { name: 'Streetlight & Power Outage', type: 'civic', description: 'Broken streetlights, dangling wires' },
      { name: 'Water Drainage & Sewage', type: 'civic', description: 'Waterlogging, pipe leaks, sewage overflow' },
      { name: 'Waste & Sanitation', type: 'civic', description: 'Uncollected garbage, illegal dumping' },
      { name: 'Public Safety & Security', type: 'crime', description: 'Vandalism, unsafe areas, harassment' },
      { name: 'Bribery & Extortion', type: 'crime', description: 'Corrupt demands, bribery in public offices' },
    ];

    for (const cat of categories) {
      await AppDataSource.query(
        `INSERT INTO categories (name, type, description) VALUES ($1, $2, $3);`,
        [cat.name, cat.type, cat.description],
      );
      console.log(`   ✓ Category: ${cat.name}`);
    }
  } else {
    console.log(`   ✓ ${categoriesCount[0].count} categories already present.`);
  }

  // 4. Seed Fresh Smart Parking Lots
  console.log('\n🚗 Seeding fresh Smart Parking Lots...');
  const lots = [
    { name: 'Banani Square Smart Lot', location: 'Road 11, Banani, Dhaka', hourlyRate: 100, peakRate: 150, totalSlots: 30, availableSlots: 30 },
    { name: 'Gulshan 2 Public Parking Hub', location: 'Gulshan 2 Circle, Dhaka', hourlyRate: 120, peakRate: 180, totalSlots: 50, availableSlots: 50 },
    { name: 'Dhanmondi Lakefront Garage', location: 'Road 32, Dhanmondi, Dhaka', hourlyRate: 80, peakRate: 120, totalSlots: 25, availableSlots: 25 },
  ];

  for (const lot of lots) {
    const lotRes = await AppDataSource.query(
      `INSERT INTO parking_lots (name, location, "hourlyRate", "peakRate", "totalSlots", "availableSlots", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id;`,
      [lot.name, lot.location, lot.hourlyRate, lot.peakRate, lot.totalSlots, lot.availableSlots],
    );
    const lotId = lotRes[0].id;

    // Seed slots
    for (let i = 1; i <= lot.totalSlots; i++) {
      const slotNumber = `P-${String.fromCharCode(65 + Math.floor((i - 1) / 10))}${((i - 1) % 10) + 1}`;
      const floor = i <= 15 ? 'G' : '1';
      const zone = i % 2 === 0 ? 'Teal' : 'Cyan';
      await AppDataSource.query(
        `INSERT INTO parking_slots ("slotNumber", floor, zone, status, "parkingLotId")
         VALUES ($1, $2, $3, 'available', $4);`,
        [slotNumber, floor, zone, lotId],
      );
    }
    console.log(`   ✓ Parking Hub: ${lot.name} (${lot.totalSlots} available slots)`);
  }

  await AppDataSource.destroy();
  console.log('\n✨ Database is now fresh, clean, and ready with all roles intact!\n');
}

resetFresh().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
