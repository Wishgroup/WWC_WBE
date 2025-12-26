/**
 * Test Setup Script
 * Verifies backend setup and database connectivity
 */

import { query } from '../database/connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function testSetup() {
  console.log('🧪 Testing Wish Waves Club Backend Setup...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣  Testing database connection...');
    const dbTest = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('   ✅ Database connected');
    console.log(`   📅 Server time: ${dbTest.rows[0].current_time}`);
    console.log(`   🗄️  PostgreSQL: ${dbTest.rows[0].pg_version.split(',')[0]}\n`);

    // Test 2: Check Tables
    console.log('2️⃣  Checking database tables...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const expectedTables = [
      'members', 'nfc_cards', 'vendors', 'pos_readers', 'country_rules',
      'nfc_tap_logs', 'fraud_events', 'offers', 'offer_usage_logs',
      'admin_users', 'audit_logs'
    ];
    
    const existingTables = tables.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length === 0) {
      console.log(`   ✅ All ${expectedTables.length} tables exist\n`);
    } else {
      console.log(`   ⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('   💡 Run: npm run migrate\n');
    }

    // Test 3: Check Indexes
    console.log('3️⃣  Checking database indexes...');
    const indexes = await query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    console.log(`   ✅ ${indexes.rows[0].count} indexes found\n`);

    // Test 4: Environment Variables
    console.log('4️⃣  Checking environment variables...');
    const requiredEnvVars = [
      'DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET', 
      'NFC_ENCRYPTION_KEY', 'ADMIN_API_KEY'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingEnvVars.length === 0) {
      console.log('   ✅ All required environment variables set\n');
    } else {
      console.log(`   ⚠️  Missing: ${missingEnvVars.join(', ')}`);
      console.log('   💡 Check your .env file\n');
    }

    // Test 5: Test Service Imports
    console.log('5️⃣  Testing service modules...');
    try {
      const FraudEngine = (await import('../services/FraudDetectionEngine.js')).default;
      const CountryEngine = (await import('../services/CountryRuleEngine.js')).default;
      const OfferEngine = (await import('../services/OfferEngine.js')).default;
      const NFCPipeline = (await import('../services/NFCValidationPipeline.js')).default;
      const CardService = (await import('../services/NFCCardService.js')).default;
      
      console.log('   ✅ All service modules loaded successfully\n');
    } catch (error) {
      console.log(`   ❌ Service import error: ${error.message}\n`);
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Setup test completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (missingTables.length === 0 && missingEnvVars.length === 0) {
      console.log('🎉 Backend is ready to use!');
      console.log('   Start server: npm run dev\n');
    } else {
      console.log('⚠️  Please fix the issues above before starting the server\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check database is running');
    console.error('   2. Verify database credentials in .env');
    console.error('   3. Run migration: npm run migrate');
    process.exit(1);
  }
}

testSetup();





