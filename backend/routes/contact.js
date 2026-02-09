/**
 * Contact & Subscription Routes
 * Handles newsletter subscriptions, inquiries, and contact forms
 */

import express from 'express';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { sendSubscriptionThankYou, sendInquiryEmail } from '../services/EmailService.js';
import { query } from '../database/connection.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

/**
 * POST /api/contact/subscribe
 * Subscribe to newsletter (Stay Connected form)
 */
router.post('/subscribe', apiLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Check if email already exists in subscriptions
    const existingSub = await query(
      'SELECT id FROM newsletter_subscriptions WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );

    if (existingSub.rows.length > 0) {
      // Email already subscribed, but still send thank you email
      try {
        await sendSubscriptionThankYou(email.toLowerCase());
        return res.json({
          success: true,
          message: 'Thank you for subscribing!',
          alreadySubscribed: true,
        });
      } catch (emailError) {
        console.error('Error sending subscription email:', emailError);
        // Still return success even if email fails
        return res.json({
          success: true,
          message: 'You are already subscribed',
          alreadySubscribed: true,
        });
      }
    }

    // Insert new subscription
    await query(
      'INSERT INTO newsletter_subscriptions (email, subscribed_at, status) VALUES (?, NOW(), ?)',
      [email.toLowerCase(), 'active']
    );

    // Send thank you email
    try {
      await sendSubscriptionThankYou(email.toLowerCase());
    } catch (emailError) {
      console.error('Error sending subscription email:', emailError);
      // Continue even if email fails
    }

    // Log audit
    await logAudit({
      userType: 'public',
      action: 'newsletter_subscription',
      resourceType: 'subscription',
      details: { email: email.toLowerCase() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Thank you for subscribing to Wish Waves Club!',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process subscription' 
    });
  }
});

/**
 * POST /api/contact/inquiry
 * Submit contact inquiry
 */
router.post('/inquiry', apiLimiter, async (req, res) => {
  try {
    const { name, email, subject, message, phone, inquiryType } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email, and message are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Save inquiry to database
    await query(
      `INSERT INTO contact_inquiries 
       (name, email, phone, subject, message, inquiry_type, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        email.toLowerCase(),
        phone || null,
        subject || 'General Inquiry',
        message,
        inquiryType || 'general',
        'new',
      ]
    );

    // Send inquiry email to info@wishwavesclub.com
    try {
      await sendInquiryEmail({
        name,
        email: email.toLowerCase(),
        subject: subject || 'General Inquiry',
        message,
        phone,
        inquiryType: inquiryType || 'general',
      });
    } catch (emailError) {
      console.error('Error sending inquiry email:', emailError);
      // Continue even if email fails - inquiry is saved in database
    }

    // Log audit
    await logAudit({
      userType: 'public',
      action: 'contact_inquiry',
      resourceType: 'inquiry',
      details: { 
        email: email.toLowerCase(),
        subject: subject || 'General Inquiry',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit inquiry' 
    });
  }
});

export default router;



