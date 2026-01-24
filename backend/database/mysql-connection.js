/**
 * MySQL Connection for Wish Waves Club
 * Using mysql2 with connection pooling
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wwc_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
};

let pool = null;

/**
 * Connect to MySQL database
 */
export const connectDB = async () => {
  try {
    if (pool) {
      // Test connection
      const connection = await pool.getConnection();
      connection.release();
      return pool;
    }

    pool = mysql.createPool(DB_CONFIG);
    
    // Test connection
    const connection = await pool.getConnection();
    connection.release();
    
    console.log('✅ MySQL connected successfully');
    console.log(`📊 Database: ${DB_CONFIG.database} @ ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    
    return pool;
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    throw error;
  }
};

/**
 * Get database pool instance
 */
export const getDB = async () => {
  if (!pool) {
    await connectDB();
  }
  return pool;
};

/**
 * Execute a SQL query
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result with rows and rowCount
 */
export const query = async (sql, params = []) => {
  try {
    const db = await getDB();
    const [rows, fields] = await db.execute(sql, params);
    
    // For INSERT/UPDATE/DELETE, mysql2 returns OkPacket which has insertId, affectedRows, etc.
    // For SELECT, it returns an array of rows
    const isResultSet = Array.isArray(rows);
    const insertId = !isResultSet && rows?.insertId ? rows.insertId : null;
    const affectedRows = !isResultSet && rows?.affectedRows ? rows.affectedRows : (isResultSet ? rows.length : 0);
    
    // Create a result object that mimics PostgreSQL format but includes MySQL-specific fields
    const result = {
      rows: isResultSet ? rows : [],
      rowCount: isResultSet ? rows.length : affectedRows,
      insertId: insertId,
      affectedRows: affectedRows,
      fields: fields,
    };
    
    // For INSERT operations, add insertId to rows object for compatibility
    if (insertId && !isResultSet) {
      result.rows.insertId = insertId;
    }
    
    return result;
  } catch (error) {
    console.error('Query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

/**
 * Execute a transaction
 * @param {Function} callback - Async function that receives a connection
 * @returns {Promise<any>} Result from callback
 */
export const transaction = async (callback) => {
  const db = await getDB();
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Close database connection pool
 */
export const closeDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL connection pool closed');
  }
};

/**
 * Get a connection from the pool (for advanced usage)
 */
export const getConnection = async () => {
  const db = await getDB();
  return await db.getConnection();
};

// Initialize connection on import
connectDB().catch(console.error);

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

export default { connectDB, getDB, query, transaction, closeDB, getConnection };

