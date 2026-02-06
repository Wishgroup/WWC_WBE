/**
 * Authentication Routes
 * Login, registration, and user management
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { logAudit } from '../services/AuditService.js';
import { sendLoginNotification } from '../services/EmailService.js';

const router = express.Router();

/**
 * Calculate account status and next action for a user
 * @param {Object} userData - User data from database
 * @param {string} role - User role ('member', 'vendor', 'admin')
 * @returns {Object} - { allowed, account_status, next_action }
 */
function calculateAccountStatus(userData, role) {
  if (role === 'admin') {
    // Admins are always allowed if is_active
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

    // Check if expired (for annual memberships)
    let isExpired = false;
    if (membershipType === 'annual' && subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate);
      const now = new Date();
      isExpired = endDate < now;
    }

    // Active if: status='active' AND payment='success'/'paid' AND not expired
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

    // Determine next action based on status
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

    // Default: show submitted page
    return {
      allowed: false,
      account_status: 'submitted',
      next_action: '/application/submitted',
    };
  }

  if (role === 'vendor') {
    // Check vendor_status if it exists, otherwise use is_active
    const vendorStatus = userData.vendor_status || (userData.is_active ? 'active' : 'pending');
    const paymentStatus = userData.payment_status || 'pending';

    // Active if: status='active' AND payment='success'/'paid'
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

    // Determine next action based on status
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

    // Default: show submitted page
    return {
      allowed: false,
      account_status: 'submitted',
      next_action: '/application/submitted',
    };
  }

  // Default fallback
  return {
    allowed: false,
    account_status: 'unknown',
    next_action: '/login',
  };
}

/**
 * POST /api/auth/register
 * Register a new member
 */
router.post('/register', apiLimiter, async (req, res) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      membershipType,
      // Additional fields that might be provided
      firstName,
      lastName,
      phoneNumber,
      mobileNumber,
      address,
      country,
      idNumber,
      idType,
    } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id, email FROM members WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Build full name from firstName/lastName if provided, otherwise use fullName
    const finalFullName = fullName || (firstName && lastName ? `${firstName} ${lastName}` : 'Member');

    // Prepare address JSON
    const addressJson = (address || country) ? JSON.stringify({
      street: address || '',
      country: country || '',
    }) : null;

    // Create user with pending payment status - save ALL provided data
    const result = await query(
      `INSERT INTO members (
        email, password_hash, full_name, first_name, last_name, 
        mobile_number, membership_type, membership_status, payment_status,
        fraud_status, fraud_score, role, address, id_number, id_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email.toLowerCase(),
        passwordHash,
        finalFullName,
        firstName || null,
        lastName || null,
        phoneNumber || mobileNumber || null,
        membershipType || 'annual',
        'pending', // Will be activated after payment
        'pending',
        'clean',
        0,
        'member',
        addressJson,
        idNumber || null,
        idType || null,
      ]
    );

    const memberId = result.rows.insertId;
    
    console.log('✅ New member registered and saved to database:', {
      id: memberId,
      email: email.toLowerCase(),
      fullName: finalFullName,
      firstName: firstName || 'N/A',
      lastName: lastName || 'N/A',
      mobileNumber: phoneNumber || mobileNumber || 'N/A',
      address: addressJson ? JSON.parse(addressJson) : 'N/A',
      idNumber: idNumber || 'N/A',
      idType: idType || 'N/A',
      membershipType: membershipType || 'annual',
      membershipStatus: 'pending',
      paymentStatus: 'pending',
      role: 'member',
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: memberId.toString(), email: email.toLowerCase(), role: 'member' },
      process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
      { expiresIn: '7d' }
    );

    // Log audit
    await logAudit({
      userType: 'system',
      action: 'member_registered',
      resourceType: 'member',
      resourceId: memberId,
      details: { email: email.toLowerCase() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: memberId.toString(),
        email: email.toLowerCase(),
        fullName: finalFullName,
        role: 'member',
        membershipType: membershipType || 'annual',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login member, admin, or vendor
 */
router.post('/login', apiLimiter, async (req, res) => {
  try {
    const { email, password, userType = 'member' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = null;
    let role = 'member';

    if (userType === 'admin') {
      // Check admin users
      const adminResult = await query(
        'SELECT id, email, password_hash, full_name, role FROM admin_users WHERE email = ? AND is_active = 1',
        [email.toLowerCase()]
      );
      if (adminResult.rows.length > 0) {
        user = adminResult.rows[0];
        role = 'admin';
      }
    } else if (userType === 'vendor') {
      // Check vendors - include status fields for active gating
      const vendorResult = await query(
        `SELECT id, email, password_hash, vendor_name as full_name, 
         COALESCE(vendor_status, CASE WHEN is_active = 1 THEN 'active' ELSE 'pending' END) as vendor_status,
         payment_status, is_active
         FROM vendors WHERE email = ?`,
        [email.toLowerCase()]
      );
      if (vendorResult.rows.length > 0) {
        user = vendorResult.rows[0];
        role = 'vendor';
      }
    } else {
      // Check members - include status fields for active gating
      const memberResult = await query(
        `SELECT id, email, password_hash, full_name, membership_type, 
         membership_status, payment_status, subscription_end_date
         FROM members WHERE email = ?`,
        [email.toLowerCase()]
      );
      if (memberResult.rows.length > 0) {
        user = memberResult.rows[0];
        role = 'member';
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordHash = user.password_hash;
    if (!passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login for admin users
    if (userType === 'admin') {
      await query(
        'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id.toString(),
        email: user.email,
        role: role,
      },
      process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
      { expiresIn: '7d' }
    );

    // Calculate account status and next action
    const statusInfo = calculateAccountStatus(user, role);

    // Log audit
    await logAudit({
      userType: role,
      action: 'user_login',
      resourceType: userType,
      resourceId: user.id,
      details: { 
        email: user.email,
        account_status: statusInfo.account_status,
        allowed: statusInfo.allowed,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Send login notification email (only for members, not admins/vendors)
    if (role === 'member') {
      try {
        const loginTime = new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Dubai',
          dateStyle: 'full',
          timeStyle: 'long',
        });
        await sendLoginNotification(
          user.email,
          user.full_name,
          loginTime,
          req.ip
        );
      } catch (emailError) {
        console.error('Error sending login notification email:', emailError);
        // Don't fail login if email fails
      }
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: role,
        membershipType: user.membership_type || null,
      },
      allowed: statusInfo.allowed,
      account_status: statusInfo.account_status,
      next_action: statusInfo.next_action,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;

    let user = null;

    if (role === 'admin') {
      const adminResult = await query(
        'SELECT id, email, full_name, role, is_active FROM admin_users WHERE id = ?',
        [userId]
      );
      if (adminResult.rows.length > 0) {
        user = adminResult.rows[0];
      }
    } else if (role === 'vendor') {
      const vendorResult = await query(
        `SELECT id, email, vendor_name as full_name, 
         COALESCE(vendor_status, CASE WHEN is_active = 1 THEN 'active' ELSE 'pending' END) as vendor_status,
         payment_status, is_active
         FROM vendors WHERE id = ?`,
        [userId]
      );
      if (vendorResult.rows.length > 0) {
        user = vendorResult.rows[0];
      }
    } else {
      const memberResult = await query(
        `SELECT id, email, full_name, membership_type, 
         membership_status, payment_status, subscription_end_date
         FROM members WHERE id = ?`,
        [userId]
      );
      if (memberResult.rows.length > 0) {
        user = memberResult.rows[0];
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate account status and next action
    const statusInfo = calculateAccountStatus(user, role);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: role,
        membershipType: user.membership_type || null,
      },
      allowed: statusInfo.allowed,
      account_status: statusInfo.account_status,
      next_action: statusInfo.next_action,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * PUT /api/auth/profile-icon
 * Update user's profile icon style preference
 */
router.put('/profile-icon', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { iconStyle } = req.body;

    // Validate icon style
    const validStyles = ['initials', 'circle', 'square', 'gradient'];
    if (!iconStyle || !validStyles.includes(iconStyle)) {
      return res.status(400).json({ error: 'Invalid icon style' });
    }

    let result;
    if (role === 'admin') {
      result = await query(
        'UPDATE admin_users SET profile_icon_style = ?, updated_at = NOW() WHERE id = ?',
        [iconStyle, userId]
      );
    } else if (role === 'vendor') {
      result = await query(
        'UPDATE vendors SET profile_icon_style = ?, updated_at = NOW() WHERE id = ?',
        [iconStyle, userId]
      );
    } else {
      result = await query(
        'UPDATE members SET profile_icon_style = ?, updated_at = NOW() WHERE id = ?',
        [iconStyle, userId]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log audit
    await logAudit({
      userType: role,
      action: 'profile_icon_updated',
      resourceType: role,
      resourceId: userId,
      details: { iconStyle },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Profile icon style updated',
      iconStyle,
    });
  } catch (error) {
    console.error('Update profile icon error:', error);
    res.status(500).json({ error: 'Failed to update profile icon' });
  }
});

/**
 * POST /api/auth/save-personal-info
 * Save personal information during registration (before payment)
 */
router.post('/save-personal-info', apiLimiter, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      address,
      country,
      phoneNumber,
      email,
      idNumber,
      idType,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !address || !country || !phoneNumber || !email || !idNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'All required fields must be provided' 
      });
    }

    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id FROM members WHERE email = ?',
      [email.toLowerCase()]
    );

    const fullName = `${firstName} ${lastName}`;
    const addressJson = JSON.stringify({
      street: address,
      country: country,
    });

    if (existingUserResult.rows.length > 0) {
      // Update existing user with personal information
      await query(
        `UPDATE members SET 
          full_name = ?, first_name = ?, last_name = ?, 
          mobile_number = ?, address = ?, id_number = ?, id_type = ?,
          updated_at = NOW()
        WHERE email = ?`,
        [
          fullName,
          firstName,
          lastName,
          phoneNumber,
          addressJson,
          idNumber,
          idType || 'emirates_id',
          email.toLowerCase(),
        ]
      );
      
      res.json({
        success: true,
        message: 'Personal information updated',
        userId: existingUserResult.rows[0].id.toString(),
      });
    } else {
      // Create new member record with pending status
      const result = await query(
        `INSERT INTO members (
          full_name, first_name, last_name, email, mobile_number,
          address, id_number, id_type, membership_status, payment_status,
          fraud_status, fraud_score, role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullName,
          firstName,
          lastName,
          email.toLowerCase(),
          phoneNumber,
          addressJson,
          idNumber,
          idType || 'emirates_id',
          'pending',
          'pending',
          'clean',
          0,
          'member',
        ]
      );

      const memberId = result.rows.insertId;

      // Log audit
      await logAudit({
        userType: 'system',
        action: 'personal_info_saved',
        resourceType: 'member',
        resourceId: memberId,
        details: { email: email.toLowerCase() },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: 'Personal information saved',
        userId: memberId.toString(),
      });
    }
  } catch (error) {
    console.error('Save personal info error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save personal information' 
    });
  }
});

/**
 * POST /api/auth/set-password
 * Set password for member account (after bank transfer verification)
 * Allows members who paid via bank transfer to set their password
 */
router.post('/set-password', apiLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Find member with verified membership
    const memberResult = await query(
      `SELECT id, email, membership_status, payment_status, password_hash 
       FROM members 
       WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Member account not found. Please contact support if you believe this is an error.' 
      });
    }

    const member = memberResult.rows[0];

    // Check if password is already set
    if (member.password_hash) {
      return res.status(400).json({ 
        success: false,
        error: 'Password is already set. Use "Forgot Password" if you need to reset it.' 
      });
    }

    // Verify membership is active (payment verified by admin)
    if (member.membership_status !== 'active' || member.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false,
        error: 'Your membership is not yet activated. Please wait for admin verification of your payment, or contact support if you have already made the payment.' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await query(
      'UPDATE members SET password_hash = ?, updated_at = NOW() WHERE email = ?',
      [passwordHash, email.toLowerCase()]
    );

    // Log audit
    await logAudit({
      userType: 'member',
      action: 'password_set',
      resourceType: 'member',
      resourceId: member.id,
      details: { 
        email: email.toLowerCase(),
        method: 'bank_transfer_setup'
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Password set successfully. You can now login with your email and password.'
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to set password. Please try again or contact support.' 
    });
  }
});

export default router;
