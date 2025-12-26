/**
 * Seed Test Users for Authentication Testing
 * Creates test members, vendors, and admins with known passwords
 */

import { connectDB, getCollection, closeDB } from '../database/mongodb-connection.js';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const TEST_PASSWORD = 'test123'; // Same password for all test users

const testUsers = {
  members: [
    {
      email: 'member1@test.com',
      password: TEST_PASSWORD,
      full_name: 'John Member',
      membership_type: 'annual',
      membership_status: 'active',
      fraud_status: 'clean',
      fraud_score: 0,
      role: 'member',
      country_code: 'AE',
      city: 'Dubai',
    },
    {
      email: 'member2@test.com',
      password: TEST_PASSWORD,
      full_name: 'Sarah Member',
      membership_type: 'lifetime',
      membership_status: 'active',
      fraud_status: 'clean',
      fraud_score: 0,
      role: 'member',
      country_code: 'AE',
      city: 'Abu Dhabi',
    },
  ],
  vendors: [
    {
      email: 'vendor1@test.com',
      password: TEST_PASSWORD,
      vendor_name: 'Coffee Shop XYZ',
      vendor_code: 'VENDOR_TEST_001',
      country_code: 'AE',
      city: 'Dubai',
      currency: 'AED',
      is_active: true,
      role: 'vendor',
    },
    {
      email: 'vendor2@test.com',
      password: TEST_PASSWORD,
      vendor_name: 'Restaurant ABC',
      vendor_code: 'VENDOR_TEST_002',
      country_code: 'AE',
      city: 'Dubai',
      currency: 'AED',
      is_active: true,
      role: 'vendor',
    },
  ],
  admins: [
    {
      email: 'admin@test.com',
      password: TEST_PASSWORD,
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
    },
  ],
};

async function seedTestUsers() {
  try {
    console.log('🔄 Starting test user seeding...');
    await connectDB();

    // Hash password function
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    };

    // Seed Members
    console.log('\n📝 Seeding Members...');
    const membersCollection = await getCollection('members');
    for (const member of testUsers.members) {
      const existing = await membersCollection.findOne({ email: member.email });
      if (existing) {
        console.log(`   ⏭️  Member ${member.email} already exists, skipping...`);
      } else {
        const passwordHash = await hashPassword(member.password);
        const memberDoc = {
          ...member,
          password_hash: passwordHash,
          created_at: new Date(),
          updated_at: new Date(),
        };
        delete memberDoc.password;
        const result = await membersCollection.insertOne(memberDoc);
        console.log(`   ✅ Created member: ${member.email} (ID: ${result.insertedId})`);
      }
    }

    // Seed Vendors
    console.log('\n📝 Seeding Vendors...');
    const vendorsCollection = await getCollection('vendors');
    for (const vendor of testUsers.vendors) {
      const existing = await vendorsCollection.findOne({ email: vendor.email });
      if (existing) {
        console.log(`   ⏭️  Vendor ${vendor.email} already exists, skipping...`);
      } else {
        const passwordHash = await hashPassword(vendor.password);
        const vendorDoc = {
          ...vendor,
          password_hash: passwordHash,
          created_at: new Date(),
          updated_at: new Date(),
        };
        delete vendorDoc.password;
        const result = await vendorsCollection.insertOne(vendorDoc);
        console.log(`   ✅ Created vendor: ${vendor.email} (ID: ${result.insertedId})`);
      }
    }

    // Seed Admins
    console.log('\n📝 Seeding Admins...');
    const adminsCollection = await getCollection('admin_users');
    for (const admin of testUsers.admins) {
      const existing = await adminsCollection.findOne({ email: admin.email });
      if (existing) {
        console.log(`   ⏭️  Admin ${admin.email} already exists, skipping...`);
      } else {
        const passwordHash = await hashPassword(admin.password);
        const adminDoc = {
          ...admin,
          password_hash: passwordHash,
          created_at: new Date(),
          updated_at: new Date(),
        };
        delete adminDoc.password;
        const result = await adminsCollection.insertOne(adminDoc);
        console.log(`   ✅ Created admin: ${admin.email} (ID: ${result.insertedId})`);
      }
    }

    // Create some NFC cards for test members
    console.log('\n💳 Creating NFC Cards for test members...');
    const members = await membersCollection.find({ email: { $in: testUsers.members.map(m => m.email) } }).toArray();
    const nfcCardsCollection = await getCollection('nfc_cards');
    
    for (const member of members) {
      const existingCard = await nfcCardsCollection.findOne({ member_id: member._id });
      if (!existingCard) {
        const cardUid = `CARD${member._id.toString().substring(0, 8).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
        const cardDoc = {
          card_uid: cardUid,
          member_id: member._id,
          card_status: 'active',
          issued_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        };
        await nfcCardsCollection.insertOne(cardDoc);
        console.log(`   ✅ Created NFC card ${cardUid} for ${member.email}`);
      }
    }

    console.log('\n✅ Test user seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👤 MEMBERS:');
    testUsers.members.forEach(m => {
      console.log(`   Email: ${m.email}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
      console.log(`   Name: ${m.full_name}`);
      console.log('');
    });
    console.log('🏪 VENDORS:');
    testUsers.vendors.forEach(v => {
      console.log(`   Email: ${v.email}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
      console.log(`   Name: ${v.vendor_name}`);
      console.log('');
    });
    console.log('👨‍💼 ADMINS:');
    testUsers.admins.forEach(a => {
      console.log(`   Email: ${a.email}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
      console.log(`   Name: ${a.full_name}`);
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n💡 All test users have the same password: ${TEST_PASSWORD}`);
    console.log('💡 Use these credentials to test login at /login');

  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestUsers()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default seedTestUsers;

