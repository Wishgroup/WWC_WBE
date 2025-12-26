/**
 * Migration Script: Add Auth0 Support
 * Adds auth0_id and auth0_metadata fields to existing users
 * Prepares database for Auth0 integration
 */

import { connectDB, getCollection } from '../database/mongodb-connection.js';

async function migrateToAuth0() {
  console.log('🔄 Starting Auth0 migration...\n');

  try {
    await connectDB();

    const migrationReport = {
      members: { updated: 0, total: 0 },
      admin_users: { updated: 0, total: 0 },
      vendors: { updated: 0, total: 0 },
      errors: [],
    };

    // 1. Migrate Members
    console.log('1️⃣  Migrating members...');
    const membersCollection = await getCollection('members');
    const members = await membersCollection.find({}).toArray();
    migrationReport.members.total = members.length;

    for (const member of members) {
      try {
        const updateData = {
          updated_at: new Date(),
        };

        // Add auth0_id if it doesn't exist
        if (!member.auth0_id) {
          updateData.auth0_id = null;
        }

        // Add auth0_metadata if it doesn't exist
        if (!member.auth0_metadata) {
          updateData.auth0_metadata = {
            last_synced: null,
          };
        }

        await membersCollection.updateOne(
          { _id: member._id },
          { $set: updateData }
        );
        migrationReport.members.updated++;
      } catch (error) {
        migrationReport.errors.push({
          collection: 'members',
          documentId: member._id,
          error: error.message,
        });
        console.error(`   ❌ Error updating member ${member._id}:`, error.message);
      }
    }
    console.log(`   ✅ Updated ${migrationReport.members.updated}/${migrationReport.members.total} members\n`);

    // 2. Migrate Admin Users
    console.log('2️⃣  Migrating admin users...');
    const adminCollection = await getCollection('admin_users');
    const admins = await adminCollection.find({}).toArray();
    migrationReport.admin_users.total = admins.length;

    for (const admin of admins) {
      try {
        const updateData = {
          updated_at: new Date(),
        };

        if (!admin.auth0_id) {
          updateData.auth0_id = null;
        }

        if (!admin.auth0_metadata) {
          updateData.auth0_metadata = {
            last_synced: null,
          };
        }

        await adminCollection.updateOne(
          { _id: admin._id },
          { $set: updateData }
        );
        migrationReport.admin_users.updated++;
      } catch (error) {
        migrationReport.errors.push({
          collection: 'admin_users',
          documentId: admin._id,
          error: error.message,
        });
        console.error(`   ❌ Error updating admin ${admin._id}:`, error.message);
      }
    }
    console.log(`   ✅ Updated ${migrationReport.admin_users.updated}/${migrationReport.admin_users.total} admin users\n`);

    // 3. Migrate Vendors
    console.log('3️⃣  Migrating vendors...');
    const vendorsCollection = await getCollection('vendors');
    const vendors = await vendorsCollection.find({}).toArray();
    migrationReport.vendors.total = vendors.length;

    for (const vendor of vendors) {
      try {
        const updateData = {
          updated_at: new Date(),
        };

        if (!vendor.auth0_id) {
          updateData.auth0_id = null;
        }

        if (!vendor.auth0_metadata) {
          updateData.auth0_metadata = {
            last_synced: null,
          };
        }

        await vendorsCollection.updateOne(
          { _id: vendor._id },
          { $set: updateData }
        );
        migrationReport.vendors.updated++;
      } catch (error) {
        migrationReport.errors.push({
          collection: 'vendors',
          documentId: vendor._id,
          error: error.message,
        });
        console.error(`   ❌ Error updating vendor ${vendor._id}:`, error.message);
      }
    }
    console.log(`   ✅ Updated ${migrationReport.vendors.updated}/${migrationReport.vendors.total} vendors\n`);

    // 4. Create indexes for auth0_id
    console.log('4️⃣  Creating indexes for auth0_id...');
    try {
      await membersCollection.createIndex({ auth0_id: 1 }, { unique: true, sparse: true, name: 'idx_auth0_id' });
      await adminCollection.createIndex({ auth0_id: 1 }, { unique: true, sparse: true, name: 'idx_auth0_id' });
      await vendorsCollection.createIndex({ auth0_id: 1 }, { unique: true, sparse: true, name: 'idx_auth0_id' });
      console.log('   ✅ Indexes created\n');
    } catch (error) {
      console.warn('   ⚠️  Some indexes may already exist:', error.message);
    }

    // Print migration report
    console.log('📊 Migration Report:');
    console.log('═══════════════════════════════════════════');
    console.log(`Members:      ${migrationReport.members.updated}/${migrationReport.members.total} updated`);
    console.log(`Admin Users: ${migrationReport.admin_users.updated}/${migrationReport.admin_users.total} updated`);
    console.log(`Vendors:     ${migrationReport.vendors.updated}/${migrationReport.vendors.total} updated`);
    console.log(`Errors:      ${migrationReport.errors.length}`);
    
    if (migrationReport.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      migrationReport.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.collection} (${error.documentId}): ${error.error}`);
      });
    }

    console.log('\n✅ Migration completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Set up Auth0 application and API');
    console.log('   2. Configure environment variables (AUTH0_DOMAIN, AUTH0_AUDIENCE, etc.)');
    console.log('   3. Create Auth0 users for existing database users');
    console.log('   4. Link Auth0 users to database records using email matching');
    console.log('   5. Notify users to reset passwords through Auth0\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateToAuth0()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

