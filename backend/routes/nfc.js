/**
 * NFC Validation API Routes
 * For vendor POS systems
 */

import express from 'express';
import { authenticateVendor } from '../middleware/auth.js';
import { nfcValidationLimiter } from '../middleware/rateLimiter.js';
import NFCValidationPipeline from '../services/NFCValidationPipeline.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

/**
 * POST /api/nfc/validate
 * Main NFC tap validation endpoint
 * Called by vendor POS systems
 */
router.post(
  '/validate',
  authenticateVendor,
  nfcValidationLimiter,
  async (req, res) => {
    try {
      const {
        cardUid,
        posReaderId,
        latitude,
        longitude,
        transactionAmount,
      } = req.body;

      // Validation
      if (!cardUid) {
        return res.status(400).json({ error: 'cardUid is required' });
      }

      if (!posReaderId) {
        return res.status(400).json({ error: 'posReaderId is required' });
      }

      // Validate NFC tap
      const validationResult = await NFCValidationPipeline.validateNFCTap({
        cardUid,
        vendorId: req.vendor.id,
        posReaderId,
        latitude,
        longitude,
        transactionAmount,
      });

      // Log API call
      await logAudit({
        userType: 'api',
        action: 'nfc_validation_request',
        resourceType: 'nfc_tap',
        details: {
          vendorId: req.vendor.id,
          cardUid,
          approved: validationResult.approved,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      if (validationResult.approved) {
        return res.status(200).json({
          success: true,
          approved: true,
          memberId: validationResult.memberId,
          membershipType: validationResult.membershipType,
          offer: validationResult.offer,
          currency: validationResult.currency,
          timestamp: validationResult.timestamp,
        });
      } else {
        return res.status(200).json({
          success: false,
          approved: false,
          reason: validationResult.reason,
          fraudScore: validationResult.fraudScore || 0,
        });
      }
    } catch (error) {
      console.error('NFC validation API error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
);

export default router;




