/**
 * Database Configuration Checker
 * Helps diagnose database connection issues
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function checkDatabaseConfig() {
  console.log('🔍 Checking Database Configuration...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check environment variables
  console.log('1️⃣  Environment Variables:');
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wwc_db',
  };

  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${config.password ? '***' + config.password.slice(-3) : 'NOT SET'}`);
  console.log(`   Database: ${config.database}\n`);

  // Check for missing values
  const missing = [];
  if (!process.env.DB_HOST) missing.push('DB_HOST');
  if (!process.env.DB_USER) missing.push('DB_USER');
  if (!process.env.DB_PASSWORD) missing.push('DB_PASSWORD');
  if (!process.env.DB_NAME) missing.push('DB_NAME');

  if (missing.length > 0) {
    console.log('   ⚠️  Missing environment variables:', missing.join(', '));
    console.log('   💡 Add these to your backend/.env file\n');
  } else {
    console.log('   ✅ All database environment variables are set\n');
  }

  // Test connection
  console.log('2️⃣  Testing Database Connection...');
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectTimeout: 5000,
    });

    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('   ✅ Connection successful!');
    console.log('   ✅ Database is accessible\n');

    // Check if tables exist
    console.log('3️⃣  Checking Database Tables...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'members'"
    );
    
    if (tables.length > 0) {
      console.log('   ✅ Database tables exist\n');
    } else {
      console.log('   ⚠️  Database tables not found');
      console.log('   💡 Run: npm run migrate\n');
    }

    await connection.end();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database configuration check completed!\n');
    
  } catch (error) {
    console.error('   ❌ Connection failed!\n');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n   💡 Possible solutions:');
      console.error('      1. MySQL service is not running (if local)');
      console.error('      2. Wrong host/port in .env file');
      console.error('      3. Database is on remote server (cPanel)');
      console.error('      4. Firewall blocking connection\n');
      console.error('   📖 See: DATABASE_CONNECTION_FIX.md\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n   💡 Possible solutions:');
      console.error('      1. Check username and password in .env');
      console.error('      2. Verify database user has proper permissions');
      console.error('      3. Check if user exists in MySQL\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n   💡 Possible solutions:');
      console.error('      1. Database does not exist');
      console.error('      2. Create database in cPanel');
      console.error('      3. Check database name in .env\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

checkDatabaseConfig().catch(console.error);

