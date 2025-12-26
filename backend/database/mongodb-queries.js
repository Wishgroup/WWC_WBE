/**
 * MongoDB Query Helpers
 * Provides PostgreSQL-like interface for MongoDB operations
 */

import { getCollection } from './mongodb-connection.js';

/**
 * Execute a MongoDB query and return PostgreSQL-like result format
 */
export const query = async (collectionName, filter = {}, options = {}) => {
  const collection = await getCollection(collectionName);
  
  // If options has 'select' (SQL-like), convert to MongoDB projection
  if (options.select) {
    const projection = {};
    options.select.split(',').forEach(field => {
      projection[field.trim()] = 1;
    });
    options.projection = projection;
    delete options.select;
  }
  
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
 * Insert one document
 */
export const insert = async (collectionName, document) => {
  const collection = await getCollection(collectionName);
  const result = await collection.insertOne(document);
  return {
    rows: [{ ...document, _id: result.insertedId }],
    rowCount: 1,
    insertedId: result.insertedId,
  };
};

/**
 * Update documents
 */
export const update = async (collectionName, filter, updateDoc, options = {}) => {
  const collection = await getCollection(collectionName);
  const result = await collection.updateOne(filter, { $set: updateDoc }, options);
  return {
    rowCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

/**
 * Update many documents
 */
export const updateMany = async (collectionName, filter, updateDoc, options = {}) => {
  const collection = await getCollection(collectionName);
  const result = await collection.updateMany(filter, { $set: updateDoc }, options);
  return {
    rowCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

/**
 * Delete documents
 */
export const deleteDoc = async (collectionName, filter) => {
  const collection = await getCollection(collectionName);
  const result = await collection.deleteOne(filter);
  return {
    rowCount: result.deletedCount,
  };
};

/**
 * Count documents
 */
export const count = async (collectionName, filter = {}) => {
  const collection = await getCollection(collectionName);
  const count = await collection.countDocuments(filter);
  return {
    rows: [{ count: count.toString() }],
    rowCount: 1,
  };
};


