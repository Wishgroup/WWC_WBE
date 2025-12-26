/**
 * Authentication Middleware
 */

import jwt from 'jsonwebtoken';
import { query } from '../database/connection.js';

/**
 * Verify JWT token
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Verify admin API key
 */
export const authenticateAdmin = async (req, res, next) => {
  const apiKey = req.headers['x-admin-api-key'] || req.headers['authorization']?.split(' ')[1];
  const expectedKey = process.env.ADMIN_API_KEY || 'dev_admin_api_key_change_in_production';

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Admin API key required' });
  }

  // Optionally verify admin user from database
  if (req.user?.userId) {
    const admin = await query(
      `SELECT * FROM admin_users WHERE id = $1 AND is_active = true`,
      [req.user.userId]
    );

    if (admin.rows.length === 0) {
      return res.status(403).json({ error: 'Admin access denied' });
    }

    req.admin = admin.rows[0];
  }

  next();
};

/**
 * Verify vendor API key (for POS systems)
 */
export const authenticateVendor = async (req, res, next) => {
  const apiKey = req.headers['x-vendor-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Vendor API key required' });
  }

  // Verify vendor from database
  const vendor = await query(
    `SELECT * FROM vendors WHERE vendor_code = $1 AND is_active = true`,
    [apiKey]
  );

  if (vendor.rows.length === 0) {
    return res.status(403).json({ error: 'Invalid vendor API key' });
  }

  req.vendor = vendor.rows[0];
  next();
};




