/**
 * MongoDB Connection for Wish Waves Club
 * Using MongoDB Atlas credentials
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 
  `mongodb+srv://wishwavesclub_db_user:7F9aME4dudmAK66A@wwcregister1.aj85oin.mongodb.net/wwc_db?retryWrites=true&w=majority`;

const DB_NAME = process.env.MONGODB_DB_NAME || 'wwc_db';

let client = null;
let db = null;

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    if (client && client.topology && client.topology.isConnected()) {
      return db;
    }

    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${DB_NAME}`);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDB = async () => {
  if (!db) {
    await connectDB();
  }
  return db;
};

/**
 * Get collection
 */
export const getCollection = async (collectionName) => {
  const database = await getDB();
  return database.collection(collectionName);
};

/**
 * Close database connection
 */
export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

/**
 * Create indexes for a collection
 */
export const createIndexes = async (collectionName, indexDefinitions) => {
  try {
    const collection = await getCollection(collectionName);
    await collection.createIndexes(indexDefinitions);
    console.log(`✅ Indexes created for ${collectionName}`);
  } catch (error) {
    console.error(`Error creating indexes for ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Initialize database (create indexes)
 */
export const initializeDB = async () => {
  try {
    await connectDB();
    const { indexes } = await import('./mongodb-schema.js');
    
    // Create indexes for all collections
    for (const [collectionName, indexDefs] of Object.entries(indexes)) {
      await createIndexes(collectionName, indexDefs);
    }
    
    console.log('✅ Database initialized with all indexes');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

export default { connectDB, getDB, getCollection, closeDB, initializeDB };

