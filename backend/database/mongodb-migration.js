/**
 * MongoDB Migration Script
 * Creates collections and indexes based on schema
 */

import { connectDB, initializeDB } from './mongodb-connection.js';
import { collections, indexes } from './mongodb-schema.js';

async function migrate() {
  try {
    console.log('🔄 Starting MongoDB migration...');
    
    // Connect to database
    await connectDB();
    
    // Initialize all indexes
    await initializeDB();
    
    console.log('✅ MongoDB migration completed successfully!');
    console.log('\n📊 Collections created:');
    Object.values(collections).forEach(name => {
      console.log(`  - ${name}`);
    });
    console.log('\n✨ Database ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();


