/**
 * Authentication Routes
 * Auth0-based authentication with database sync
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollection } from '../database/mongodb-connection.js';
import { authenticateAuth0, requireAuth0, extractAuth0User } from '../middleware/auth0.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { syncAuth0User, getUserByAuth0Id } from '../services/UserSyncService.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

/**
 * POST /api/auth/sync
 * Sync Auth0 user with database
 * Called after Auth0 authentication to ensure user exists in database
 */
router.post('/sync', 
  apiLimiter,
  authenticateAuth0,
  extractAuth0User,
  requireAuth0,
  async (req, res) => {
    try {
      if (!req.auth0User) {
        return res.status(401).json({ error: 'Auth0 user information required' });
      }

      // Sync user with database
      const user = await syncAuth0User(req.auth0User, req);

      // Determine user type for response
      const userType = req.auth0User.user_type || 'member';
      const role = user.role || userType;

      res.json({
        success: true,
        user: {
          id: user._id || user.id,
          email: user.email,
          fullName: user.full_name || user.fullName || user.vendor_name,
          role: role,
          membershipType: user.membership_type || user.membershipType,
          auth0_id: user.auth0_id,
        },
      });
    } catch (error) {
      console.error('User sync error:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current authenticated user from database
 * Requires Auth0 authentication
 */
router.get('/me', 
  authenticateAuth0,
  extractAuth0User,
  requireAuth0,
  async (req, res) => {
    try {
      if (!req.auth0User || !req.auth0User.auth0_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { auth0_id, user_type } = req.auth0User;
      const userType = user_type || 'member';

      // Get user from database
      let user = await getUserByAuth0Id(auth0_id, userType);

      // If user not found, sync them
      if (!user) {
        user = await syncAuth0User(req.auth0User, req);
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const role = user.role || userType;

      res.json({
        success: true,
        user: {
          id: user._id || user.id,
          email: user.email,
          fullName: user.full_name || user.fullName || user.vendor_name,
          role: role,
          membershipType: user.membership_type || user.membershipType,
          auth0_id: user.auth0_id,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
);

/**
 * POST /api/auth/callback
 * Handle Auth0 callback (optional, for server-side flows)
 * For SPA, this is typically handled client-side
 */
router.post('/callback', apiLimiter, (req, res) => {
  // Auth0 callback is typically handled client-side for SPAs
  // This endpoint can be used for additional server-side processing if needed
  res.json({
    success: true,
    message: 'Auth0 callback received. Authentication handled client-side.',
  });
});

/**
 * POST /api/auth/logout
 * Logout endpoint (mainly for audit logging)
 * Actual logout is handled by Auth0 client-side
 */
router.post('/logout',
  apiLimiter,
  authenticateAuth0,
  extractAuth0User,
  async (req, res) => {
    try {
      if (req.auth0User && req.auth0User.auth0_id) {
        const { auth0_id, user_type } = req.auth0User;
        const userType = user_type || 'member';

        // Get user for audit logging
        const user = await getUserByAuth0Id(auth0_id, userType);

        if (user) {
          await logAudit({
            userType: userType,
            action: 'user_logout',
            resourceType: userType,
            resourceId: user._id || user.id,
            details: { email: user.email },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          });
        }
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Don't fail logout even if audit logging fails
      res.json({
        success: true,
        message: 'Logout successful',
      });
    }
  }
);

export default router;
