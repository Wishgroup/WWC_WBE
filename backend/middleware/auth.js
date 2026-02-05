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
      `SELECT * FROM admin_users WHERE id = ? AND is_active = true`,
      [parseInt(req.user.userId, 10)]
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
    `SELECT * FROM vendors WHERE vendor_code = ? AND is_active = true`,
    [apiKey]
  );

  if (vendor.rows.length === 0) {
    return res.status(403).json({ error: 'Invalid vendor API key' });
  }

  req.vendor = vendor.rows[0];
  next();
};

/**
 * Verify POS device authentication (Phase 4)
 * Requires X-POS-READER-ID and X-POS-DEVICE-KEY headers
 */
export const authenticatePOSDevice = async (req, res, next) => {
  const readerId = req.headers['x-pos-reader-id'];
  const deviceKey = req.headers['x-pos-device-key'];

  if (!readerId || !deviceKey) {
    return res.status(401).json({ 
      success: false,
      error: 'POS device authentication required (X-POS-READER-ID and X-POS-DEVICE-KEY headers)' 
    });
  }

  try {
    // Hash the provided device key
    const crypto = await import('crypto');
    const deviceKeyHash = crypto.createHash('sha256').update(deviceKey).digest('hex');

    // Find reader with matching device_key_hash
    const readerResult = await query(
      `SELECT pr.*, v.id as vendor_id, v.vendor_name, v.country, v.city, v.currency
       FROM pos_readers pr
       JOIN vendors v ON pr.vendor_id = v.id
       WHERE pr.reader_id = ? AND pr.device_key_hash = ? AND pr.is_active = 1 AND v.is_active = 1`,
      [readerId, deviceKeyHash]
    );

    if (readerResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid POS device credentials' 
      });
    }

    const reader = readerResult.rows[0];
    req.posReader = reader;
    req.vendor = {
      id: reader.vendor_id,
      vendor_name: reader.vendor_name,
      country: reader.country,
      city: reader.city,
      currency: reader.currency,
    };

    next();
  } catch (error) {
    console.error('POS device authentication error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

/**
 * Calculate account status and next action for a user
 * (Same logic as in routes/auth.js - consider extracting to shared utility)
 */
function calculateAccountStatus(userData, role) {
  if (role === 'admin') {
    return {
      allowed: userData.is_active !== 0 && userData.is_active !== false,
      account_status: userData.is_active ? 'active' : 'inactive',
      next_action: userData.is_active ? '/admin/dashboard' : '/login',
    };
  }

  if (role === 'member') {
    const membershipStatus = userData.membership_status || 'pending';
    const paymentStatus = userData.payment_status || 'pending';
    const subscriptionEndDate = userData.subscription_end_date;
    const membershipType = userData.membership_type || 'annual';

    let isExpired = false;
    if (membershipType === 'annual' && subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate);
      const now = new Date();
      isExpired = endDate < now;
    }

    const isActive = 
      membershipStatus === 'active' && 
      (paymentStatus === 'success' || paymentStatus === 'paid') && 
      !isExpired;

    if (isActive) {
      return {
        allowed: true,
        account_status: 'active',
        next_action: '/member/dashboard',
      };
    }

    if (membershipStatus === 'rejected') {
      return {
        allowed: false,
        account_status: 'rejected',
        next_action: '/application/rejected',
      };
    }

    if (paymentStatus === 'pending' || paymentStatus === null) {
      return {
        allowed: false,
        account_status: 'payment_pending',
        next_action: '/payment/pending',
      };
    }

    if (membershipStatus === 'submitted' || membershipStatus === 'pending') {
      return {
        allowed: false,
        account_status: 'pending',
        next_action: '/application/pending',
      };
    }

    if (isExpired) {
      return {
        allowed: false,
        account_status: 'expired',
        next_action: '/payment/pending',
      };
    }

    return {
      allowed: false,
      account_status: 'submitted',
      next_action: '/application/submitted',
    };
  }

  if (role === 'vendor') {
    const vendorStatus = userData.vendor_status || (userData.is_active ? 'active' : 'pending');
    const paymentStatus = userData.payment_status || 'pending';

    const isActive = 
      vendorStatus === 'active' && 
      (paymentStatus === 'success' || paymentStatus === 'paid');

    if (isActive) {
      return {
        allowed: true,
        account_status: 'active',
        next_action: '/vendor/dashboard',
      };
    }

    if (vendorStatus === 'rejected') {
      return {
        allowed: false,
        account_status: 'rejected',
        next_action: '/application/rejected',
      };
    }

    if (paymentStatus === 'pending' || paymentStatus === null) {
      return {
        allowed: false,
        account_status: 'payment_pending',
        next_action: '/payment/pending',
      };
    }

    if (vendorStatus === 'submitted' || vendorStatus === 'pending') {
      return {
        allowed: false,
        account_status: 'pending',
        next_action: '/application/pending',
      };
    }

    return {
      allowed: false,
      account_status: 'submitted',
      next_action: '/application/submitted',
    };
  }

  return {
    allowed: false,
    account_status: 'unknown',
    next_action: '/login',
  };
}

/**
 * Require active member status
 * Must be used after authenticateToken
 */
export const requireActiveMember = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'member') {
      return res.status(403).json({ 
        success: false,
        error: 'Member access required' 
      });
    }

    // Fetch member with status fields
    const memberResult = await query(
      `SELECT id, email, full_name, membership_type, 
       membership_status, payment_status, subscription_end_date
       FROM members WHERE id = ?`,
      [userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    const member = memberResult.rows[0];
    const statusInfo = calculateAccountStatus(member, 'member');

    if (!statusInfo.allowed) {
      return res.status(403).json({
        success: false,
        error: 'Account is not active',
        account_status: statusInfo.account_status,
        next_action: statusInfo.next_action,
      });
    }

    req.member = member;
    next();
  } catch (error) {
    console.error('requireActiveMember error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

/**
 * Require active vendor status
 * Must be used after authenticateToken
 */
export const requireActiveVendor = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'vendor') {
      return res.status(403).json({ 
        success: false,
        error: 'Vendor access required' 
      });
    }

    // Fetch vendor with status fields
    const vendorResult = await query(
      `SELECT id, email, vendor_name as full_name, 
       COALESCE(vendor_status, CASE WHEN is_active = 1 THEN 'active' ELSE 'pending' END) as vendor_status,
       payment_status, is_active
       FROM vendors WHERE id = ?`,
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Vendor not found' 
      });
    }

    const vendor = vendorResult.rows[0];
    const statusInfo = calculateAccountStatus(vendor, 'vendor');

    if (!statusInfo.allowed) {
      return res.status(403).json({
        success: false,
        error: 'Account is not active',
        account_status: statusInfo.account_status,
        next_action: statusInfo.next_action,
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('requireActiveVendor error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};




