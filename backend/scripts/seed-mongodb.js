/**
 * Seed Sample Data for MongoDB
 * Creates sample data for testing
 */

import { connectDB, getCollection } from '../database/mongodb-connection.js';
import bcrypt from 'bcryptjs';

async function seedData() {
  console.log('🌱 Seeding MongoDB with sample data...\n');

  try {
    await connectDB();

    // 1. Create Admin User
    console.log('1️⃣  Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUsers = await getCollection('admin_users');
    await adminUsers.insertOne({
      email: 'admin@wishwavesclub.com',
      password_hash: adminPassword,
      full_name: 'Admin User',
      role: 'super_admin',
      is_active: true,
      created_at: new Date(),
    });
    console.log('   ✅ Admin user created (email: admin@wishwavesclub.com, password: admin123)\n');

    // 2. Create Sample Member
    console.log('2️⃣  Creating sample member...');
    const members = await getCollection('members');
    const memberResult = await members.insertOne({
      email: 'member@example.com',
      full_name: 'John Doe',
      phone: '+971501234567',
      country: 'United Arab Emirates',
      city: 'Dubai',
      membership_type: 'annual',
      membership_status: 'active',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      payment_amount: 100.00,
      payment_status: 'paid',
      fraud_score: 0,
      fraud_status: 'clean',
      created_at: new Date(),
      updated_at: new Date(),
    });
    const memberId = memberResult.insertedId;
    console.log(`   ✅ Member created (ID: ${memberId})\n`);

    // 3. Create Sample NFC Card
    console.log('3️⃣  Creating sample NFC card...');
    const nfcCards = await getCollection('nfc_cards');
    await nfcCards.insertOne({
      member_id: memberId,
      card_uid: 'CARD123456789',
      encrypted_token: 'encrypted_token_sample',
      card_status: 'active',
      is_primary: true,
      issued_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('   ✅ NFC card created (UID: CARD123456789)\n');

    // 4. Create Sample Vendor
    console.log('4️⃣  Creating sample vendor...');
    const vendors = await getCollection('vendors');
    const vendorResult = await vendors.insertOne({
      vendor_name: 'Sample Restaurant',
      vendor_code: 'VENDOR001',
      country: 'United Arab Emirates',
      city: 'Dubai',
      currency: 'AED',
      category: 'restaurant',
      allowed_membership_tiers: ['annual', 'lifetime'],
      max_discount_percentage: 20.00,
      tax_rate: 5.00,
      is_active: true,
      compliance_status: 'compliant',
      created_at: new Date(),
      updated_at: new Date(),
    });
    const vendorId = vendorResult.insertedId;
    console.log(`   ✅ Vendor created (ID: ${vendorId}, Code: VENDOR001)\n`);

    // 5. Create POS Reader
    console.log('5️⃣  Creating POS reader...');
    const posReaders = await getCollection('pos_readers');
    await posReaders.insertOne({
      vendor_id: vendorId,
      reader_id: 'POS001',
      reader_name: 'Main Counter',
      location_description: 'Ground floor, main entrance',
      is_active: true,
      created_at: new Date(),
    });
    console.log('   ✅ POS reader created (ID: POS001)\n');

    // 6. Create Country Rule
    console.log('6️⃣  Creating country rule for UAE...');
    const countryRules = await getCollection('country_rules');
    await countryRules.insertOne({
      country_code: 'AE',
      country_name: 'United Arab Emirates',
      allowed_membership_types: ['annual', 'lifetime'],
      max_discount_percentage: 25.00,
      currency: 'AED',
      tax_rules: { vat_rate: 5.0 },
      compliance_restrictions: {},
      blackout_periods: {},
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('   ✅ Country rule created (UAE)\n');

    // 7. Create Sample Offer
    console.log('7️⃣  Creating sample offer...');
    const offers = await getCollection('offers');
    await offers.insertOne({
      offer_code: 'WELCOME10',
      offer_type: 'percentage',
      membership_type: null, // All membership types
      vendor_category: 'restaurant',
      country_code: 'AE',
      discount_percentage: 10.00,
      min_purchase_amount: 50.00,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      usage_limit: 5, // 5 uses per member
      priority: 10,
      is_active: true,
      conditions: {},
      created_at: new Date(),
      updated_at: new Date(),
    });
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


