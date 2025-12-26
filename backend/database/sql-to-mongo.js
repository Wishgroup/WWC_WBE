/**
 * SQL to MongoDB Query Converter
 * Converts simple SQL patterns to MongoDB queries
 */

import { getCollection } from './mongodb-connection.js';
import { ObjectId } from 'mongodb';

/**
 * Convert SQL WHERE clause with $1, $2 parameters to MongoDB filter
 */
function convertWhereClause(sql, params = []) {
  const filter = {};
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
  
  if (!whereMatch) {
    return filter;
  }
  
  const whereClause = whereMatch[1];
  
  // Handle multiple conditions with AND
  const conditions = whereClause.split(/\s+AND\s+/i);
  
  conditions.forEach(condition => {
    condition = condition.trim();
    
    // column = $1
    const equalMatch = condition.match(/(\w+)\s*=\s*\$(\d+)/i);
    if (equalMatch) {
      const paramIndex = parseInt(equalMatch[2]) - 1;
      let value = params[paramIndex];
      let columnName = equalMatch[1];
      
      // Map 'id' to '_id' for MongoDB
      if (columnName === 'id') {
        columnName = '_id';
      }
      
      // Convert to ObjectId if column is _id or ends with _id
      if (columnName === '_id' || columnName.endsWith('_id')) {
        // Try to convert to ObjectId if it's a string
        if (typeof value === 'string' && ObjectId.isValid(value)) {
          value = new ObjectId(value);
        } else if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') {
          // Already ObjectId
        } else if (typeof value === 'string' && value.length === 24) {
          // Looks like ObjectId string
          try {
            value = new ObjectId(value);
          } catch (e) {
            // Keep as string if conversion fails
          }
        } else if (value && value.toString && ObjectId.isValid(value.toString())) {
          // ObjectId object, convert to string then back to ObjectId
          try {
            value = new ObjectId(value.toString());
          } catch (e) {
            // Keep as is
          }
        }
      }
      
      filter[columnName] = value;
      return;
    }
    
    // column != $1 or column <> $1
    const notEqualMatch = condition.match(/(\w+)\s*(?:!=|<>)\s*\$(\d+)/i);
    if (notEqualMatch) {
      const paramIndex = parseInt(notEqualMatch[2]) - 1;
      filter[notEqualMatch[1]] = { $ne: params[paramIndex] };
      return;
    }
    
    // column > $1, column < $1, column >= $1, column <= $1
    const comparisonMatch = condition.match(/(\w+)\s*(>|>=|<|<=)\s*\$(\d+)/i);
    if (comparisonMatch) {
      const paramIndex = parseInt(comparisonMatch[3]) - 1;
      const operator = comparisonMatch[2];
      const mongoOp = operator === '>' ? '$gt' : operator === '>=' ? '$gte' : 
                     operator === '<' ? '$lt' : '$lte';
      if (!filter[comparisonMatch[1]]) {
        filter[comparisonMatch[1]] = {};
      }
      filter[comparisonMatch[1]][mongoOp] = params[paramIndex];
      return;
    }
    
    // column IS NULL
    if (condition.match(/(\w+)\s+IS\s+NULL/i)) {
      const columnMatch = condition.match(/(\w+)\s+IS\s+NULL/i);
      filter[columnMatch[1]] = null;
      return;
    }
    
    // column IS NOT NULL
    if (condition.match(/(\w+)\s+IS\s+NOT\s+NULL/i)) {
      const columnMatch = condition.match(/(\w+)\s+IS\s+NOT\s+NULL/i);
      filter[columnMatch[1]] = { $ne: null };
      return;
    }
    
    // column IN ($1, $2, ...)
    const inMatch = condition.match(/(\w+)\s+IN\s+\((.+)\)/i);
    if (inMatch) {
      const paramMatches = inMatch[2].match(/\$(\d+)/g);
      if (paramMatches) {
        filter[inMatch[1]] = {
          $in: paramMatches.map(m => params[parseInt(m.substring(1)) - 1])
        };
      }
      return;
    }
  });
  
  return filter;
}

/**
 * Execute SQL-like query on MongoDB collection
 */
export async function sqlQuery(sql, params = []) {
  // Extract table/collection name
  const tableMatch = sql.match(/FROM\s+(\w+)/i) || sql.match(/INTO\s+(\w+)/i) || sql.match(/UPDATE\s+(\w+)/i);
  if (!tableMatch) {
    throw new Error('Could not determine collection name from SQL');
  }
  
  const collectionName = tableMatch[1];
  const collection = await getCollection(collectionName);
  
  // Handle SELECT queries
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    const filter = convertWhereClause(sql, params);
    const options = {};
    
    // Handle projection (SELECT specific columns)
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch && !selectMatch[1].includes('*')) {
      const columns = selectMatch[1].split(',').map(c => c.trim());
      const projection = {};
      columns.forEach(col => {
        projection[col] = 1;
      });
      options.projection = projection;
    }
    
    // Handle ORDER BY
    const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)/i);
    if (orderMatch) {
      options.sort = { [orderMatch[1]]: orderMatch[2].toUpperCase() === 'DESC' ? -1 : 1 };
    }
    
    // Handle multiple ORDER BY
    const multiOrderMatch = sql.match(/ORDER BY\s+(.+?)(?:\s+LIMIT|$)/i);
    if (multiOrderMatch && !orderMatch) {
      const orders = multiOrderMatch[1].split(',').map(o => o.trim());
      options.sort = {};
      orders.forEach(order => {
        const parts = order.split(/\s+/);
        const col = parts[0];
        const dir = parts[1]?.toUpperCase() === 'DESC' ? -1 : 1;
        options.sort[col] = dir;
      });
    }
    
    // Handle LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      options.limit = parseInt(limitMatch[1]);
    }
    
    const results = await collection.find(filter, options).toArray();
    
    // Map _id to id for compatibility
    const mappedResults = results.map(doc => {
      if (doc._id) {
        return { ...doc, id: doc._id.toString() };
      }
      return doc;
    });
    
    return { rows: mappedResults, rowCount: mappedResults.length };
  }
  
  // Handle INSERT queries
  if (sql.trim().toUpperCase().startsWith('INSERT')) {
    // Parse INSERT INTO table (col1, col2, ...) VALUES ($1, $2, ...) [RETURNING ...]
    const intoMatch = sql.match(/INTO\s+(\w+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/is);
    if (intoMatch) {
      const columns = intoMatch[2].split(',').map(c => c.trim());
      let valuesStr = intoMatch[3];
      
      // Remove RETURNING clause if present
      valuesStr = valuesStr.replace(/\s+RETURNING.*$/i, '');
      
      // Parse values - handle arrays and complex values
      const values = [];
      let current = '';
      let parenDepth = 0;
      
      for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
        else if (char === ',' && parenDepth === 0) {
          values.push(current.trim());
          current = '';
          continue;
        }
        current += char;
      }
      if (current.trim()) {
        values.push(current.trim());
      }
      
      const document = {};
      columns.forEach((col, index) => {
        if (index >= values.length) return;
        const value = values[index];
        if (value && value.startsWith('$')) {
          const paramIndex = parseInt(value.substring(1)) - 1;
          if (params[paramIndex] !== undefined) {
            document[col] = params[paramIndex];
          } else {
            document[col] = null;
          }
        } else if (value === 'CURRENT_TIMESTAMP' || value === 'NOW()') {
          document[col] = new Date();
        } else if (value === 'NULL' || value === 'null' || value === '') {
          document[col] = null;
        } else if (!isNaN(value) && value !== '') {
          document[col] = parseFloat(value);
        } else {
          document[col] = value.replace(/^['"]|['"]$/g, '');
        }
      });
      
      const result = await collection.insertOne(document);
      const insertedDoc = { ...document, _id: result.insertedId, id: result.insertedId.toString() };
      return { 
        rows: [insertedDoc], 
        rowCount: 1,
        insertedId: result.insertedId
      };
    }
    throw new Error('Could not parse INSERT query: ' + sql.substring(0, 100));
  }
  
  // Handle UPDATE queries
  if (sql.trim().toUpperCase().startsWith('UPDATE')) {
    const filter = convertWhereClause(sql, params);
    
    // Extract SET clause
    const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
    if (!setMatch) {
      throw new Error('Could not parse UPDATE SET clause');
    }
    
    const updateDoc = {};
    // Simple parsing - in production, use a proper SQL parser
    const setClause = setMatch[1];
    const assignments = setClause.split(',');
    assignments.forEach(assign => {
      const [key, value] = assign.split('=').map(s => s.trim());
      if (value && value.startsWith('$')) {
        const paramIndex = parseInt(value.substring(1)) - 1;
        updateDoc[key] = params[paramIndex];
      } else if (value === 'CURRENT_TIMESTAMP') {
        updateDoc[key] = new Date();
      } else if (value === 'NULL' || value === 'null') {
        updateDoc[key] = null;
      } else if (!isNaN(value)) {
        updateDoc[key] = parseFloat(value);
      } else {
        // Remove quotes
        updateDoc[key] = value.replace(/^['"]|['"]$/g, '');
      }
    });
    
    const result = await collection.updateOne(filter, { $set: updateDoc });
    return { rowCount: result.modifiedCount, matchedCount: result.matchedCount };
  }
  
  // Handle COUNT queries
  if (sql.includes('COUNT(*)')) {
    const filter = convertWhereClause(sql, params);
    const count = await collection.countDocuments(filter);
    return { rows: [{ count: count.toString() }], rowCount: 1 };
  }
  
  throw new Error(`Unsupported SQL query: ${sql}`);
}

