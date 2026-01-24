/**
 * Database Connection for Wish Waves Club
 * Using MySQL (tashjeel.ae)
 * This module provides a unified interface for database operations
 */

import { connectDB as mysqlConnect, getDB as mysqlGetDB, query as mysqlQuery, transaction as mysqlTransaction, closeDB as mysqlCloseDB } from './mysql-connection.js';

// Re-export MySQL functions with same API
export const connectDB = mysqlConnect;
export const getDB = mysqlGetDB;
export const query = mysqlQuery;
export const transaction = mysqlTransaction;
export const closeDB = mysqlCloseDB;

/**
 * Get collection - deprecated, use query() with SQL instead
 * Kept for backward compatibility during migration
 */
export const getCollection = async (collectionName) => {
  console.warn(`getCollection('${collectionName}') is deprecated. Use SQL queries instead.`);
  throw new Error('getCollection is not supported with MySQL. Use SQL queries via query() function.');
};

// Initialize connection on import
connectDB().catch(console.error);

export default { connectDB, getDB, query, transaction, closeDB };
