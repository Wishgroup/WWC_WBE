/**
 * Seed Sample Data
 * Creates sample data for testing
 */

import { query } from '../database/connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedData() {
  console.log('🌱 Seeding sample data...\n');

  try {
    // 1. Create Admin User
    console.log('1️⃣  Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await query(
      `INSERT INTO admin_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@wishwavesclub.com', adminPassword, 'Admin User', 'super_admin']
    );
    console.log('   ✅ Admin user created (email: admin@wishwavesclub.com, password: admin123)\n');

    // 2. Create Sample Member
    console.log('2️⃣  Creating sample member...');
    const memberResult = await query(
      `INSERT INTO members 
       (email, full_name, phone, country, city, membership_type, membership_status, 
        subscription_start_date, subscription_end_date, payment_amount, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (email) DO UPDATE SET id = members.id
       RETURNING id`,
      [
        'member@example.com',
        'John Doe',
        '+971501234567',
        'United Arab Emirates',
        'Dubai',
        'annual',
        'active',
        new Date(),
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        100.00,
        'paid'
      ]
    );
    const memberId = memberResult.rows[0].id;
    console.log(`   ✅ Member created (ID: ${memberId})\n`);

    // 3. Create Sample NFC Card
    console.log('3️⃣  Creating sample NFC card...');
    const cardResult = await query(
      `INSERT INTO nfc_cards (member_id, card_uid, encrypted_token, card_status, is_primary)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (card_uid) DO NOTHING
       RETURNING id`,
      [memberId, 'CARD123456789', 'encrypted_token_sample', 'active', true]
    );
    console.log('   ✅ NFC card created (UID: CARD123456789)\n');

    // 4. Create Sample Vendor
    console.log('4️⃣  Creating sample vendor...');
    const vendorResult = await query(
      `INSERT INTO vendors 
       (vendor_name, vendor_code, country, city, currency, category, 
        allowed_membership_tiers, max_discount_percentage, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (vendor_code) DO UPDATE SET id = vendors.id
       RETURNING id`,
      [
        'Sample Restaurant',
        'VENDOR001',
        'United Arab Emirates',
        'Dubai',
        'AED',
        'restaurant',
        ['annual', 'lifetime'],
        20.00,
        true
      ]
    );
    const vendorId = vendorResult.rows[0].id;
    console.log(`   ✅ Vendor created (ID: ${vendorId}, Code: VENDOR001)\n`);

    // 5. Create POS Reader
    console.log('5️⃣  Creating POS reader...');
    await query(
      `INSERT INTO pos_readers (vendor_id, reader_id, reader_name, location_description, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (reader_id) DO NOTHING`,
      [vendorId, 'POS001', 'Main Counter', 'Ground floor, main entrance', true]
    );
    console.log('   ✅ POS reader created (ID: POS001)\n');

    // 6. Create Country Rule
    console.log('6️⃣  Creating country rule for UAE...');
    await query(
      `INSERT INTO country_rules 
       (country_code, country_name, allowed_membership_types, max_discount_percentage, 
        currency, tax_rules, compliance_restrictions, blackout_periods, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (country_code) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
      [
        'AE',
        'United Arab Emirates',
        ['annual', 'lifetime'],
        25.00,
        'AED',
        JSON.stringify({ vat_rate: 5.0 }),
        JSON.stringify({}),
        JSON.stringify({}),
        true
      ]
    );
    console.log('   ✅ Country rule created (UAE)\n');

    // 7. Create Sample Offer
    console.log('7️⃣  Creating sample offer...');
    await query(
      `INSERT INTO offers 
       (offer_code, offer_type, membership_type, vendor_category, country_code,
        discount_percentage, min_purchase_amount, valid_from, valid_until, 
        usage_limit, priority, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (offer_code) DO NOTHING`,
      [
        'WELCOME10',
        'percentage',
        null, // All membership types
        'restaurant',
        'AE',
        10.00,
        50.00,
        new Date(),
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        5, // 5 uses per member
        10,
        true
      ]
    );
    console.log('   ✅ Sample offer created (WELCOME10 - 10% off)\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Sample data seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@wishwavesclub.com / admin123');
    console.log('   Member: member@example.com');
    console.log('   Card UID: CARD123456789');
    console.log('   Vendor Code: VENDOR001');
    console.log('   POS Reader: POS001\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();





