/**
 * Bank Transfer Payment Routes
 * Handles bank transfer payments with receipt upload
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../database/connection.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { logAudit } from '../services/AuditService.js';
import { sendWelcomeEmail } from '../services/EmailService.js';
import crypto from 'crypto';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'bank-receipts');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: fileFilter,
});

/**
 * POST /api/payment/bank-transfer
 * Submit bank transfer payment with receipt
 */
router.post('/bank-transfer', apiLimiter, upload.single('receipt'), async (req, res) => {
  try {
    const {
      membershipType,
      amount,
      firstName,
      lastName,
      fullName,
      email,
      phoneNumber,
      mobileNumber,
      address,
      country,
      idNumber,
      idType,
      userId,
    } = req.body;

    // Validate required fields
    if (!membershipType || !amount || !email || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Validate receipt file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Bank transfer receipt is required',
      });
    }

    // Generate unique order ID
    const uniqueId = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderId = `BT-${Date.now()}-${uniqueId}`;

    // Save receipt file path
    const receiptPath = `/uploads/bank-receipts/${req.file.filename}`;
    const receiptFileName = req.file.filename;
    const receiptOriginalName = req.file.originalname;
    const receiptMimeType = req.file.mimetype;
    const receiptSize = req.file.size;

    // Prepare form data
    const formData = {
      firstName: firstName || '',
      lastName: lastName || '',
      fullName: fullName || '',
      email: email.toLowerCase(),
      phoneNumber: phoneNumber || mobileNumber || '',
      mobileNumber: phoneNumber || mobileNumber || '',
      address: address || '',
      country: country || '',
      idNumber: idNumber || '',
      idType: idType || 'emirates_id',
      membershipType: membershipType,
    };

    // Create payment session
    await query(
      `INSERT INTO payment_sessions 
       (order_id, payment_method, payment_status, amount, currency, membership_type, form_data, receipt_path, receipt_filename, receipt_original_name, receipt_mime_type, receipt_size, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        orderId,
        'bank_transfer',
        'pending_verification',
        parseFloat(amount),
        'USD',
        membershipType,
        JSON.stringify(formData),
        receiptPath,
        receiptFileName,
        receiptOriginalName,
        receiptMimeType,
        receiptSize,
      ]
    );

    // Save membership application (pending verification)
    await query(
      `INSERT INTO membership_applications 
       (order_id, full_name, first_name, last_name, email, phone_number, mobile_number, address, country, id_number, id_type, membership_type, status, payment_method, payment_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        orderId,
        formData.fullName,
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phoneNumber,
        formData.mobileNumber,
        formData.address,
        formData.country,
        formData.idNumber,
        formData.idType,
        membershipType,
        'pending_verification',
        'bank_transfer',
        'pending_verification',
      ]
    );

    // Save bank receipt record
    await query(
      `INSERT INTO bank_transfer_receipts 
       (order_id, receipt_path, receipt_filename, receipt_original_name, receipt_mime_type, receipt_size, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        orderId,
        receiptPath,
        receiptFileName,
        receiptOriginalName,
        receiptMimeType,
        receiptSize,
        'pending_verification',
      ]
    );

    // Create or update member account (pending status)
    try {
      if (userId) {
        // Update existing user
        await query(
          `UPDATE members 
           SET membership_type = ?, membership_status = 'pending_verification', payment_status = 'pending_verification', updated_at = NOW()
           WHERE id = ?`,
          [membershipType, parseInt(userId, 10)]
        );
      } else {
        // Create new member account (pending verification)
        // Note: Password will be set when user logs in or via email
        await query(
          `INSERT INTO members 
           (email, full_name, first_name, last_name, mobile_number, phone, address, country, id_number, id_type, membership_type, membership_status, payment_status, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            formData.email,
            formData.fullName,
            formData.firstName,
            formData.lastName,
            formData.mobileNumber,
            formData.phoneNumber,
            JSON.stringify({ street: formData.address, country: formData.country }),
            formData.country,
            formData.idNumber,
            formData.idType,
            membershipType,
            'pending_verification',
            'pending_verification',
            'member',
          ]
        );
      }
    } catch (memberError) {
      console.error('Error creating/updating member account:', memberError);
      // Continue even if member creation fails - will be handled during verification
    }

    // Log audit
    await logAudit({
      userType: 'member',
      action: 'bank_transfer_submitted',
      resourceType: 'payment',
      resourceId: orderId,
      details: {
        membershipType,
        amount: parseFloat(amount),
        paymentMethod: 'bank_transfer',
        receiptUploaded: true,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Bank transfer payment submitted successfully. Your application will be reviewed and activated after payment verification (usually within 24-48 hours).',
      orderId: orderId,
      paymentMethod: 'bank_transfer',
      status: 'pending_verification',
    });
  } catch (error) {
    console.error('Bank transfer payment error:', error);
    
    // Delete uploaded file if there was an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process bank transfer payment',
    });
  }
});

export default router;

