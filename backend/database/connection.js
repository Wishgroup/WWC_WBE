/**
 * MongoDB Connection for Wish Waves Club
 * Using MongoDB Atlas
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import {
  findOne,
  findMany,
  insertOne,
  insertMany,
  updateOne,
  updateMany,
  deleteOne,
  count,
  aggregate,
  transaction as mongoTransaction,
} from './mongodb-helpers.js';

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
 * MongoDB query helper (PostgreSQL-compatible interface)
 * Converts SQL-like queries to MongoDB operations
 */
export const query = async (sqlOrCollection, filterOrParams = {}, options = {}) => {
  // If first param is a string (SQL query), convert it
  if (typeof sqlOrCollection === 'string' && sqlOrCollection.includes('SELECT') || 
      sqlOrCollection.includes('INSERT') || sqlOrCollection.includes('UPDATE')) {
    const { sqlQuery } = await import('./sql-to-mongo.js');
    return await sqlQuery(sqlOrCollection, Array.isArray(filterOrParams) ? filterOrParams : []);
  }
  
  // Otherwise, treat as MongoDB collection query
  const collectionName = sqlOrCollection;
  const filter = filterOrParams;
  const collection = await getCollection(collectionName);
  
  // Execute find query
  const cursor = collection.find(filter, options);
  const results = await cursor.toArray();
  
  // Return PostgreSQL-like result format
  return {
    rows: results,
    rowCount: results.length,
  };
};

/**
 * Transaction wrapper
 */
export const transaction = mongoTransaction;

// Export MongoDB helpers
export {
  findOne,
  findMany,
  insertOne,
  insertMany,
  updateOne,
  updateMany,
  deleteOne,
  count,
  aggregate,
};

// Initialize connection on import
connectDB().catch(console.error);

export default { connectDB, getDB, getCollection, query, transaction };




