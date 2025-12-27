/**
 * Authentication Routes
 * Login, registration, and user management
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getCollection } from '../database/mongodb-connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

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
    const membersCollection = await getCollection('members');
    const existingUser = await membersCollection.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Build full name from firstName/lastName if provided, otherwise use fullName
    const finalFullName = fullName || (firstName && lastName ? `${firstName} ${lastName}` : 'Member');

    // Create user with pending payment status - save ALL provided data
    const newMember = {
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: finalFullName,
      first_name: firstName || '',
      last_name: lastName || '',
      mobile_number: phoneNumber || mobileNumber || '',
      membership_type: membershipType || 'annual',
      membership_status: 'pending', // Will be activated after payment
      payment_status: 'pending',
      fraud_status: 'clean',
      fraud_score: 0,
      role: 'member',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add address if provided
    if (address || country) {
      newMember.address = {
        street: address || '',
        country: country || '',
      };
    }

    // Add ID information if provided
    if (idNumber) {
      newMember.id_number = idNumber;
      newMember.id_type = idType || 'emirates_id';
    }

    const result = await membersCollection.insertOne(newMember);
    const memberId = result.insertedId;
    
    console.log('✅ New member registered and saved to database:', {
      id: memberId.toString(),
      email: newMember.email,
      fullName: newMember.full_name,
      firstName: newMember.first_name || 'N/A',
      lastName: newMember.last_name || 'N/A',
      mobileNumber: newMember.mobile_number || 'N/A',
      address: newMember.address || 'N/A',
      idNumber: newMember.id_number || 'N/A',
      idType: newMember.id_type || 'N/A',
      membershipType: newMember.membership_type,
      membershipStatus: newMember.membership_status,
      paymentStatus: newMember.payment_status,
      role: newMember.role,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: memberId.toString(), email: newMember.email, role: 'member' },
      process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
      { expiresIn: '7d' }
    );

    // Log audit
    await logAudit({
      userType: 'system',
      action: 'member_registered',
      resourceType: 'member',
      resourceId: memberId,
      details: { email: newMember.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: memberId.toString(),
        email: newMember.email,
        fullName: newMember.full_name,
        role: 'member',
        membershipType: newMember.membership_type,
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
      // Check admin users (if you have an admin_users collection)
      const adminCollection = await getCollection('admin_users');
      const admin = await adminCollection.findOne({ email: email.toLowerCase() });
      if (admin) {
        user = admin;
        role = 'admin';
      }
    } else if (userType === 'vendor') {
      // Check vendors
      const vendorsCollection = await getCollection('vendors');
      const vendor = await vendorsCollection.findOne({ email: email.toLowerCase() });
      if (vendor) {
        user = vendor;
        role = 'vendor';
      }
    } else {
      // Check members
      const membersCollection = await getCollection('members');
      const member = await membersCollection.findOne({ email: email.toLowerCase() });
      if (member) {
        user = member;
        role = 'member';
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordHash = user.password_hash || user.passwordHash;
    if (!passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id?.toString() || user.id?.toString(),
        email: user.email,
        role: role,
      },
      process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
      { expiresIn: '7d' }
    );

    // Log audit
    await logAudit({
      userType: role,
      action: 'user_login',
      resourceType: userType,
      resourceId: user._id || user.id,
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        fullName: user.full_name || user.fullName || user.vendor_name,
        role: role,
        membershipType: user.membership_type || user.membershipType,
      },
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
      const adminCollection = await getCollection('admin_users');
      const admin = await adminCollection.findOne({ _id: new ObjectId(userId) });
      if (admin) {
        user = admin;
      }
    } else if (role === 'vendor') {
      const vendorsCollection = await getCollection('vendors');
      const vendor = await vendorsCollection.findOne({ _id: new ObjectId(userId) });
      if (vendor) {
        user = vendor;
      }
    } else {
      const membersCollection = await getCollection('members');
      const member = await membersCollection.findOne({ _id: new ObjectId(userId) });
      if (member) {
        user = member;
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        email: user.email,
        fullName: user.full_name || user.fullName || user.vendor_name,
        role: role,
        membershipType: user.membership_type || user.membershipType,
        profileIconStyle: user.profile_icon_style || user.profileIconStyle,
      },
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

    let collection = null;
    if (role === 'admin') {
      collection = await getCollection('admin_users');
    } else if (role === 'vendor') {
      collection = await getCollection('vendors');
    } else {
      collection = await getCollection('members');
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          profile_icon_style: iconStyle,
          updated_at: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
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
    const membersCollection = await getCollection('members');
    const existingUser = await membersCollection.findOne({ 
      email: email.toLowerCase() 
    });

    const fullName = `${firstName} ${lastName}`;
    const memberData = {
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      mobile_number: phoneNumber,
      address: {
        street: address,
        country: country,
      },
      id_number: idNumber,
      id_type: idType, // 'emirates_id' or 'passport'
      membership_status: 'pending',
      payment_status: 'pending',
      fraud_status: 'clean',
      fraud_score: 0,
      role: 'member',
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (existingUser) {
      // Update existing user with personal information
      await membersCollection.updateOne(
        { email: email.toLowerCase() },
        {
          $set: {
            ...memberData,
            updated_at: new Date(),
          }
        }
      );
      
      res.json({
        success: true,
        message: 'Personal information updated',
        userId: existingUser._id.toString(),
      });
    } else {
      // Create new member record with pending status
      const result = await membersCollection.insertOne(memberData);
      const memberId = result.insertedId;

      // Log audit
      await logAudit({
        userType: 'system',
        action: 'personal_info_saved',
        resourceType: 'member',
        resourceId: memberId,
        details: { email: memberData.email },
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

export default router;

