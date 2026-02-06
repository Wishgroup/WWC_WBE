/**
 * Run all database migrations
 * Executes SQL migration files in order
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, '../database/migrations');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n');

    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order

    console.log(`Found ${files.length} migration files:\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`📄 Running: ${file}`);

      try {
        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            await query(statement);
          }
        }

        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        // Check if it's a "table already exists" or "column already exists" error
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.message.includes('Duplicate column name') ||
            error.message.includes('already exists')) {
          console.log(`⚠️  Skipped (already applied): ${file}\n`);
        } else {
          console.error(`❌ Error in ${file}:`, error.message);
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();




