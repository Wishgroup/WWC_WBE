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
    const { email, password, fullName, membershipType } = req.body;

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

    // Create user with pending payment status
    const newMember = {
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      membership_type: membershipType || 'annual',
      membership_status: 'pending', // Will be activated after payment
      payment_status: 'pending',
      fraud_status: 'clean',
      fraud_score: 0,
      role: 'member',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await membersCollection.insertOne(newMember);
    const memberId = result.insertedId;

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
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;

