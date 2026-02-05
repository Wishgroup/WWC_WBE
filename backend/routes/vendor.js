/**
 * Vendor API Routes
 * For vendor dashboard and operations
 */

import express from 'express';
import { authenticateToken, requireActiveVendor } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { query } from '../database/connection.js';
import { logAudit } from '../services/AuditService.js';
import crypto from 'crypto';

const router = express.Router();

// All vendor routes require authentication and active status
router.use(authenticateToken);
router.use(requireActiveVendor);
router.use(apiLimiter);

/**
 * GET /api/vendor/readers
 * List POS readers for authenticated vendor
 */
router.get('/readers', async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const readers = await query(
      `SELECT id, reader_id, reader_name, device_name, device_type, 
       location_description, is_active, created_at
       FROM pos_readers 
       WHERE vendor_id = ?
       ORDER BY created_at DESC`,
      [vendorId]
    );

    res.json({
      success: true,
      data: readers.rows || [],
    });
  } catch (error) {
    console.error('Get readers error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/vendor/readers
 * Register new POS reader device
 */
router.post('/readers', async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { reader_name, device_name, device_type = 'mini-pc', location_description } = req.body;

    if (!reader_name) {
      return res.status(400).json({ 
        success: false,
        error: 'reader_name is required' 
      });
    }

    // Generate unique reader_id
    const readerId = `READER_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // Generate device key (random, will be hashed)
    const deviceKey = crypto.randomBytes(32).toString('hex');
    const deviceKeyHash = crypto.createHash('sha256').update(deviceKey).digest('hex');

    // Insert reader
    const result = await query(
      `INSERT INTO pos_readers 
       (vendor_id, reader_id, reader_name, device_name, device_type, location_description, device_key_hash, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
      [
        vendorId,
        readerId,
        reader_name,
        device_name || reader_name,
        device_type,
        location_description || null,
        deviceKeyHash,
      ]
    );

    // Log audit
    await logAudit({
      userType: 'vendor',
      userId: vendorId,
      action: 'pos_reader_registered',
      resourceType: 'pos_reader',
      resourceId: result.rows.insertId,
      details: {
        reader_id: readerId,
        device_type: device_type,
      },
    });

    res.json({
      success: true,
      message: 'POS reader registered successfully',
      data: {
        reader_id: readerId,
        device_key: deviceKey, // Return plain key once (store securely)
        device_key_hash: deviceKeyHash,
        reader_name: reader_name,
        device_name: device_name || reader_name,
        device_type: device_type,
      },
    });
  } catch (error) {
    console.error('Register reader error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * GET /api/vendor/transactions
 * Get transaction history (validations + redemptions)
 */
router.get('/transactions', async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;

    let validationsQuery = `
      SELECT 
        'validation' as transaction_type,
        id,
        member_id,
        card_uid,
        pos_reader_id,
        tap_timestamp as transaction_time,
        validation_result as status,
        offer_applied,
        NULL as invoice_id,
        NULL as amount,
        NULL as final_amount
      FROM nfc_tap_logs
      WHERE vendor_id = ?
    `;

    let redemptionsQuery = `
      SELECT 
        'redemption' as transaction_type,
        id,
        member_id,
        card_uid,
        pos_reader_id,
        redeemed_at as transaction_time,
        'completed' as status,
        offer_applied,
        invoice_id,
        amount,
        final_amount
      FROM redemptions
      WHERE vendor_id = ?
    `;

    const params = [vendorId];
    const redemptionParams = [vendorId];

    if (startDate) {
      validationsQuery += ` AND tap_timestamp >= ?`;
      redemptionsQuery += ` AND redeemed_at >= ?`;
      params.push(startDate);
      redemptionParams.push(startDate);
    }

    if (endDate) {
      validationsQuery += ` AND tap_timestamp <= ?`;
      redemptionsQuery += ` AND redeemed_at <= ?`;
      params.push(endDate);
      redemptionParams.push(endDate);
    }

    validationsQuery += ` ORDER BY tap_timestamp DESC LIMIT ? OFFSET ?`;
    redemptionsQuery += ` ORDER BY redeemed_at DESC LIMIT ? OFFSET ?`;

    params.push(parseInt(limit), parseInt(offset));
    redemptionParams.push(parseInt(limit), parseInt(offset));

    // Get both validations and redemptions
    const [validations, redemptions] = await Promise.all([
      query(validationsQuery, params),
      query(redemptionsQuery, redemptionParams),
    ]);

    // Combine and sort by time
    const allTransactions = [
      ...(validations.rows || []),
      ...(redemptions.rows || []),
    ].sort((a, b) => new Date(b.transaction_time) - new Date(a.transaction_time));

    res.json({
      success: true,
      data: allTransactions,
      count: allTransactions.length,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;



