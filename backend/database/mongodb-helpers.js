/**
 * MongoDB Helper Functions
 * Replaces PostgreSQL query patterns with MongoDB operations
 */

import { getCollection } from './mongodb-connection.js';

/**
 * Find one document
 */
export const findOne = async (collectionName, filter, options = {}) => {
  const collection = await getCollection(collectionName);
  return await collection.findOne(filter, options);
};

/**
 * Find many documents
 */
export const findMany = async (collectionName, filter = {}, options = {}) => {
  const collection = await getCollection(collectionName);
  const cursor = collection.find(filter, options);
  return await cursor.toArray();
};

/**
 * Insert one document
 */
export const insertOne = async (collectionName, document) => {
  const collection = await getCollection(collectionName);
  const result = await collection.insertOne(document);
  return { ...document, _id: result.insertedId };
};

/**
 * Insert many documents
 */
export const insertMany = async (collectionName, documents) => {
  const collection = await getCollection(collectionName);
  const result = await collection.insertMany(documents);
  return result;
};

/**
 * Update one document
 */
export const updateOne = async (collectionName, filter, update, options = {}) => {
  const collection = await getCollection(collectionName);
  const result = await collection.updateOne(filter, { $set: update }, options);
  return result;
};

/**
 * Update many documents
 */
export const updateMany = async (collectionName, filter, update, options = {}) => {
  const collection = await getCollection(collectionName);
  const result = await collection.updateMany(filter, { $set: update }, options);
  return result;
};

/**
 * Delete one document
 */
export const deleteOne = async (collectionName, filter) => {
  const collection = await getCollection(collectionName);
  const result = await collection.deleteOne(filter);
  return result;
};

/**
 * Delete many documents
 */
export const deleteMany = async (collectionName, filter) => {
  const collection = await getCollection(collectionName);
  const result = await collection.deleteMany(filter);
  return result;
};

/**
 * Count documents
 */
export const count = async (collectionName, filter = {}) => {
  const collection = await getCollection(collectionName);
  return await collection.countDocuments(filter);
};

/**
 * Aggregate pipeline
 */
export const aggregate = async (collectionName, pipeline) => {
  const collection = await getCollection(collectionName);
  const cursor = collection.aggregate(pipeline);
  return await cursor.toArray();
};

/**
 * Transaction wrapper (MongoDB 4.0+)
 */
export const transaction = async (callback) => {
  const { getDB } = await import('./mongodb-connection.js');
  const db = await getDB();
  const session = db.client.startSession();
  
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * PostgreSQL-style query helper (for compatibility)
 * Converts SQL-like patterns to MongoDB
 */
export const query = async (collectionName, operation, ...args) => {
  switch (operation) {
    case 'findOne':
      return await findOne(collectionName, args[0], args[1]);
    case 'findMany':
      return await findMany(collectionName, args[0], args[1]);
    case 'insertOne':
      return await insertOne(collectionName, args[0]);
    case 'updateOne':
      return await updateOne(collectionName, args[0], args[1], args[2]);
    case 'deleteOne':
      return await deleteOne(collectionName, args[0]);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};


