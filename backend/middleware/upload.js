/**
 * File Upload Middleware
 * Handles receipt file uploads using Multer
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const receiptsDir = path.join(uploadDir, 'receipts');

// Create upload directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptsDir);
  },
  filename: (req, file, cb) => {
    // Get orderId from request body or params
    const orderId = req.body.orderId || req.params.orderId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const sanitizedOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `receipt_${sanitizedOrderId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

// Middleware for single file upload
export const uploadReceipt = upload.single('receipt');

// Helper function to get file path
export const getReceiptPath = (filename) => {
  return path.join(receiptsDir, filename);
};

// Helper function to get file URL (for serving files)
export const getReceiptUrl = (filename) => {
  return `/api/receipts/${filename}`;
};

export default upload;
