/**
 * Vendor dashboard API
 * GET /api/vendors/me, /api/vendors/pos-devices, POST /api/vendors/pos-devices, GET /api/vendors/transactions
 */

import express from 'express';
import crypto from 'crypto';
import { query } from '../database/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('vendor'));

/**
 * GET /api/vendors/me
 * Vendor profile (vendor_code, name, location, currency, etc.)
 */
router.get('/me', async (req, res) => {
  try {
    const vendorId = req.user.userId;
    let rows;
    try {
      const vRes = await query(
        `SELECT id, vendor_name, vendor_code, email, country, city, currency, category,
                is_active, COALESCE(vendor_status, 'pending') as vendor_status,
                COALESCE(payment_status, 'pending') as payment_status
         FROM vendors WHERE id = ?`,
        [vendorId]
      );
      rows = vRes.rows;
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        const vRes2 = await query(
          'SELECT id, vendor_name, vendor_code, email, country, city, currency, category, is_active FROM vendors WHERE id = ?',
          [vendorId]
        );
        rows = vRes2.rows.map((r) => ({ ...r, vendor_status: r.is_active ? 'active' : 'pending', payment_status: 'paid' }));
      } else throw e;
    }
    const vendor = rows[0];
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    res.json({
      success: true,
      profile: {
        id: vendor.id,
        vendorName: vendor.vendor_name,
        vendorCode: vendor.vendor_code,
        email: vendor.email,
        country: vendor.country,
        city: vendor.city,
        currency: vendor.currency || 'AED',
        category: vendor.category || null,
        status: (vendor.vendor_status || (vendor.is_active ? 'active' : 'pending')).toString().toLowerCase(),
      },
    });
  } catch (err) {
    console.error('GET /api/vendors/me error:', err);
    res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
});

/**
 * GET /api/vendors/pos-devices
 * List POS readers for this vendor (no device key)
 */
router.get('/pos-devices', async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const res = await query(
      `SELECT id, reader_id, reader_name, location_description, is_active, created_at
       FROM pos_readers WHERE vendor_id = ?
       ORDER BY created_at DESC`,
      [vendorId]
    );
    const devices = res.rows.map((r) => ({
      id: r.id,
      readerId: r.reader_id,
      readerName: r.reader_name || null,
      locationDescription: r.location_description || null,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at,
    }));
    res.json({ success: true, devices });
  } catch (err) {
    console.error('GET /api/vendors/pos-devices error:', err);
    res.status(500).json({ success: false, error: 'Failed to load POS devices' });
  }
});

/**
 * POST /api/vendors/pos-devices
 * Register a new POS reader (readerId, deviceKey; optional readerName).
 * Stores device_key_hash = SHA256(deviceKey). Admin does not need to approve; device is usable once created.
 */
router.post('/pos-devices', async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { readerId, deviceKey, readerName, locationDescription } = req.body || {};
    if (!readerId || !deviceKey || typeof readerId !== 'string' || typeof deviceKey !== 'string') {
      return res.status(400).json({ success: false, error: 'readerId and deviceKey are required' });
    }
    const trimmedReaderId = readerId.trim();
    if (!trimmedReaderId) {
      return res.status(400).json({ success: false, error: 'readerId cannot be empty' });
    }
    if (deviceKey.length < 16) {
      return res.status(400).json({ success: false, error: 'deviceKey must be at least 16 characters' });
    }
    const deviceKeyHash = crypto.createHash('sha256').update(deviceKey).digest('hex');

    const existingRes = await query(
      'SELECT id FROM pos_readers WHERE reader_id = ?',
      [trimmedReaderId]
    );
    if (existingRes.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'A POS device with this Reader ID already exists' });
    }

    let hasDeviceKeyHash = true;
    try {
      await query(
        `INSERT INTO pos_readers (vendor_id, reader_id, reader_name, location_description, device_key_hash, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [vendorId, trimmedReaderId, readerName || null, locationDescription || null, deviceKeyHash]
      );
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR' && /device_key_hash/i.test(e.message)) {
        hasDeviceKeyHash = false;
      } else throw e;
    }
    if (!hasDeviceKeyHash) {
      await query(
        `INSERT INTO pos_readers (vendor_id, reader_id, reader_name, location_description, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [vendorId, trimmedReaderId, readerName || null, locationDescription || null]
      );
    }

    res.status(201).json({
      success: true,
      message: 'POS device registered. Use X-POS-READER-ID and X-POS-DEVICE-KEY when calling /api/nfc/validate.',
    });
  } catch (err) {
    console.error('POST /api/vendors/pos-devices error:', err);
    res.status(500).json({ success: false, error: 'Failed to register POS device' });
  }
});

/**
 * GET /api/vendors/transactions
 * List redemptions (transactions) for this vendor
 */
router.get('/transactions', async (req, res) => {
  try {
    const vendorId = req.user.userId;
    let rows = [];
    try {
      const rRes = await query(
        `SELECT r.id, r.invoice_id, r.final_amount, r.discount_applied, r.currency, r.created_at,
                m.full_name as member_name, m.id as member_id
         FROM redemptions r
         JOIN members m ON m.id = r.member_id
         WHERE r.vendor_id = ?
         ORDER BY r.created_at DESC
         LIMIT 200`,
        [vendorId]
      );
      rows = rRes.rows;
    } catch (e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        return res.json({ success: true, transactions: [] });
      }
      throw e;
    }
    const transactions = rows.map((t) => ({
      id: t.id,
      invoiceId: t.invoice_id,
      memberName: t.member_name || 'Member',
      memberId: t.member_id,
      amount: Number(t.final_amount),
      discount: Number(t.discount_applied || 0),
      currency: t.currency || 'AED',
      createdAt: t.created_at,
    }));
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('GET /api/vendors/transactions error:', err);
    res.status(500).json({ success: false, error: 'Failed to load transactions' });
  }
});

export default router;
