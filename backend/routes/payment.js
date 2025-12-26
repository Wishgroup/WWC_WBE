/**
 * Payment Routes
 * Handles payment gateway integration and payment processing
 */

import express from 'express';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { getCollection } from '../database/mongodb-connection.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { logAudit } from '../services/AuditService.js';
import { sendWelcomeEmail } from '../services/EmailService.js';
import { validateCardDetails, createPaymentRequest, verifyPaymentResponse } from '../services/CCAvenueService.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20.acacia',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * POST /api/payment/create-session
 * Create a payment session for a user
 */
router.post('/create-session', apiLimiter, async (req, res) => {
  try {
    const { userId, membershipType } = req.body;

    if (!userId || !membershipType) {
      return res.status(400).json({ error: 'userId and membershipType are required' });
    }

    // Get user from database
    const membersCollection = await getCollection('members');
    const user = await membersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Define membership prices (in cents for Stripe)
    const membershipPrices = {
      annual: parseInt(process.env.ANNUAL_MEMBERSHIP_PRICE || '10000'), // $100.00 default
      lifetime: parseInt(process.env.LIFETIME_MEMBERSHIP_PRICE || '50000'), // $500.00 default
    };

    const amount = membershipPrices[membershipType] || membershipPrices.annual;
    const membershipTypeDisplay = membershipType === 'lifetime' ? 'Lifetime' : 'Annual';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Wish Waves Club - ${membershipTypeDisplay} Membership`,
              description: `Welcome to the Oceanic Lifestyle - ${membershipTypeDisplay} Membership`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/register?canceled=true`,
      client_reference_id: userId.toString(),
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        membershipType: membershipType,
        userName: user.full_name,
      },
    });

    // Store payment session in database
    const paymentSessionsCollection = await getCollection('payment_sessions');
    await paymentSessionsCollection.insertOne({
      session_id: session.id,
      user_id: new ObjectId(userId),
      membership_type: membershipType,
      amount: amount / 100, // Convert cents to dollars
      currency: 'usd',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Log audit
    await logAudit({
      userType: 'member',
      action: 'payment_session_created',
      resourceType: 'payment',
      resourceId: session.id,
      details: {
        userId: userId.toString(),
        membershipType: membershipType,
        amount: amount / 100,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

/**
 * POST /api/payment/webhook
 * Handle Stripe webhook events
 * Note: Raw body middleware is applied in server.js before JSON parser
 */
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const userId = session.client_reference_id;
      const sessionId = session.id;
      const membershipType = session.metadata?.membershipType || 'annual';
      const userName = session.metadata?.userName || '';

      // Update payment session status
      const paymentSessionsCollection = await getCollection('payment_sessions');
      await paymentSessionsCollection.updateOne(
        { session_id: sessionId },
        {
          $set: {
            status: 'completed',
            payment_intent_id: session.payment_intent,
            updated_at: new Date(),
          },
        }
      );

      // Update user payment status and activate membership
      const membersCollection = await getCollection('members');
      const updateResult = await membersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            payment_status: 'paid',
            payment_session_id: sessionId,
            payment_amount: session.amount_total / 100, // Convert cents to dollars
            payment_currency: session.currency,
            payment_date: new Date(),
            membership_status: 'active',
            updated_at: new Date(),
          },
        }
      );

      if (updateResult.modifiedCount > 0) {
        // Get updated user for email
        const user = await membersCollection.findOne({ _id: new ObjectId(userId) });

        // Send welcome email
        try {
          await sendWelcomeEmail(user.email, user.full_name, membershipType);
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Don't fail the webhook if email fails
        }

        // Log audit
        await logAudit({
          userType: 'system',
          action: 'payment_completed',
          resourceType: 'payment',
          resourceId: sessionId,
          details: {
            userId: userId,
            membershipType: membershipType,
            amount: session.amount_total / 100,
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        console.log(`✅ Payment completed for user ${userId}`);
      }
    } catch (error) {
      console.error('Error processing payment webhook:', error);
      // Return 200 to acknowledge receipt, but log the error
    }
  }

  res.json({ received: true });
});

/**
 * GET /api/payment/verify/:sessionId
 * Verify payment status by session ID
 */
router.get('/verify/:sessionId', apiLimiter, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Check payment session in database
    const paymentSessionsCollection = await getCollection('payment_sessions');
    const paymentSession = await paymentSessionsCollection.findOne({
      session_id: sessionId,
    });

    if (!paymentSession) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    // Also verify with Stripe
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      
      res.json({
        success: true,
        status: paymentSession.status,
        stripeStatus: stripeSession.payment_status,
        paid: paymentSession.status === 'completed' || stripeSession.payment_status === 'paid',
        amount: paymentSession.amount,
        currency: paymentSession.currency,
        membershipType: paymentSession.membership_type,
      });
    } catch (stripeError) {
      // If Stripe verification fails, still return database status
      res.json({
        success: true,
        status: paymentSession.status,
        paid: paymentSession.status === 'completed',
        amount: paymentSession.amount,
        currency: paymentSession.currency,
        membershipType: paymentSession.membership_type,
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

/**
 * POST /api/payment/ccavenue/validate-card
 * Validate card details before proceeding with payment
 */
router.post('/ccavenue/validate-card', apiLimiter, async (req, res) => {
  try {
    const { cardDetails } = req.body;

    if (!cardDetails) {
      return res.status(400).json({ error: 'Card details are required' });
    }

    const validation = validateCardDetails(cardDetails);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Log card validation attempt
    await logAudit({
      userType: 'member',
      action: 'card_validation_attempt',
      resourceType: 'payment',
      details: {
        cardNumber: cardDetails.cardNumber.replace(/\d(?=\d{4})/g, '*'), // Mask card number
        isValid: true,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Card details are valid',
    });
  } catch (error) {
    console.error('Error validating card:', error);
    res.status(500).json({ error: 'Failed to validate card details' });
  }
});

/**
 * POST /api/payment/ccavenue/initiate
 * Initiate CC Avenue payment and save membership application
 */
router.post('/ccavenue/initiate', apiLimiter, async (req, res) => {
  try {
    const {
      membershipType,
      amount,
      billingDetails,
      formData, // Full form data for membership application
    } = req.body;

    // Validate required fields
    if (!membershipType || !amount || !billingDetails || !formData) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required information. Please fill all required fields.',
        missing: {
          membershipType: !membershipType,
          amount: !amount,
          billingDetails: !billingDetails,
          formData: !formData,
        }
      });
    }

    // Validate billing details
    if (!billingDetails.name || !billingDetails.email || !billingDetails.phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required billing information (name, email, phone)',
      });
    }

    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment amount',
      });
    }

    // Generate unique order ID (CC Avenue format: alphanumeric, max 30 chars)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderId = `WWC${timestamp}${randomStr}`.substring(0, 30); // Ensure max 30 chars

    // Note: We will NOT save data to database here
    // Data will be saved only after successful payment in the response handler

    // Create payment request (card details will be collected by CC Avenue)
    const paymentRequest = createPaymentRequest({
      orderId,
      amount: paymentAmount,
      currency: 'AED',
      billingName: billingDetails.name,
      billingEmail: billingDetails.email,
      billingTel: billingDetails.phone,
      billingAddress: billingDetails.address,
      billingCity: billingDetails.city,
      billingState: billingDetails.state || '',
      billingZip: billingDetails.zip || '',
      billingCountry: billingDetails.country || 'AE',
    });

    if (!paymentRequest.success) {
      console.error('Payment request creation failed:', paymentRequest.error);
      return res.status(400).json({
        success: false,
        error: paymentRequest.error || 'Failed to create payment request',
        errors: paymentRequest.errors,
      });
    }

    // Store payment session in database
    const paymentSessionsCollection = await getCollection('payment_sessions');
    await paymentSessionsCollection.insertOne({
      order_id: orderId,
      session_id: orderId, // Using order_id as session_id for CC Avenue
      membership_type: membershipType,
      amount: parseFloat(amount),
      currency: 'AED',
      status: 'pending',
      payment_gateway: 'ccavenue',
      form_data: formData, // Store form data for later processing
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Log audit
    await logAudit({
      userType: 'member',
      action: 'payment_initiated',
      resourceType: 'payment',
      resourceId: orderId,
      details: {
        membershipType,
        amount: parseFloat(amount),
        gateway: 'ccavenue',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      orderId,
      paymentUrl: paymentRequest.paymentUrl,
      encryptedData: paymentRequest.encryptedData,
      merchantId: paymentRequest.merchantId,
      accessCode: paymentRequest.accessCode,
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to initiate payment. Please try again.' 
    });
  }
});

/**
 * POST /api/payment/ccavenue/response
 * Handle payment response from CC Avenue
 */
router.post('/ccavenue/response', async (req, res) => {
  try {
    // CC Avenue may send response via POST (form data) or GET (query params)
    const encResponse = req.body.encResponse || req.body.encResp || req.query.encResponse || req.query.encResp;

    if (!encResponse) {
      console.error('CC Avenue response: Missing encrypted response');
      return res.status(400).json({ 
        success: false,
        error: 'Payment response is required' 
      });
    }

    // Verify and decrypt payment response
    const verification = verifyPaymentResponse(encResponse);

    if (!verification.success) {
      console.error('CC Avenue response verification failed:', verification.error);
      return res.status(400).json({
        success: false,
        error: verification.error || 'Failed to verify payment response',
      });
    }

    const responseData = verification.data;
    const orderId = responseData.order_id;
    const orderStatus = responseData.order_status; // "Success", "Aborted", "Failure", "Invalid"
    
    console.log(`CC Avenue payment response received - Order ID: ${orderId}, Status: ${orderStatus}`);

    // Find payment session
    const paymentSessionsCollection = await getCollection('payment_sessions');
    const paymentSession = await paymentSessionsCollection.findOne({
      order_id: orderId,
    });

    if (!paymentSession) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    // Update payment session
    await paymentSessionsCollection.updateOne(
      { order_id: orderId },
      {
        $set: {
          status: orderStatus === 'Success' ? 'completed' : 'failed',
          payment_response: responseData,
          updated_at: new Date(),
        },
      }
    );

    // If payment successful, save membership application and create member account
    if (orderStatus === 'Success') {
      const formData = paymentSession.form_data;

      // Save membership application to database
      try {
        const membershipApplicationsCollection = await getCollection('membership_applications');
        
        const applicationData = {
          order_id: orderId,
          // Personal Information
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          nationality: formData.nationality,
          gender: formData.gender || '',
          passport_id: formData.passportId,
          
          // Contact Details
          email: formData.email.toLowerCase(),
          mobile_number: formData.mobileNumber,
          address: {
            street: formData.street,
            city: formData.city,
            country: formData.country,
          },
          
          // Membership Selection
          membership_type: formData.membershipType,
          referral_code: formData.referralCode || '',
          referred_by: formData.referredBy || '',
          renewal_preference: formData.renewalPreference || '',
          
          // Professional Information (Optional)
          occupation: formData.occupation || '',
          company_name: formData.companyName || '',
          industry: formData.industry || '',
          business_email: formData.businessEmail || '',
          
          // Emergency Contact
          emergency_contact: {
            name: formData.emergencyName,
            relationship: formData.emergencyRelationship,
            mobile: formData.emergencyMobile,
          },
          
          // Payment Details
          payment_method: formData.paymentMethod || 'Card',
          amount: parseFloat(responseData.amount),
          currency: 'AED',
          
          // Status
          status: 'completed',
          payment_status: 'paid',
          
          // Timestamps
          created_at: new Date(),
          updated_at: new Date(),
        };

        await membershipApplicationsCollection.insertOne(applicationData);
        console.log('Membership application saved after successful payment:', orderId);
      } catch (dbError) {
        console.error('Error saving membership application:', dbError);
        // Continue even if application save fails
      }

      // Create member account
      try {
        const membersCollection = await getCollection('members');
        
        // Check if member already exists
        const existingMember = await membersCollection.findOne({ 
          email: formData.email.toLowerCase() 
        });

        if (!existingMember) {
          const memberData = {
            full_name: formData.fullName,
            email: formData.email.toLowerCase(),
            mobile_number: formData.mobileNumber,
            date_of_birth: formData.dateOfBirth,
            nationality: formData.nationality,
            gender: formData.gender || '',
            passport_id: formData.passportId,
            address: {
              street: formData.street,
              city: formData.city,
              country: formData.country,
            },
            membership_type: formData.membershipType.toLowerCase(),
            membership_status: 'active',
            payment_status: 'paid',
            payment_amount: parseFloat(responseData.amount),
            payment_currency: 'AED',
            payment_date: new Date(),
            payment_session_id: orderId,
            emergency_contact: {
              name: formData.emergencyName,
              relationship: formData.emergencyRelationship,
              mobile: formData.emergencyMobile,
            },
            // Professional Information
            occupation: formData.occupation || '',
            company_name: formData.companyName || '',
            industry: formData.industry || '',
            business_email: formData.businessEmail || '',
            // Referral
            referral_code: formData.referralCode || '',
            referred_by: formData.referredBy || '',
            renewal_preference: formData.renewalPreference || '',
            // Fraud status
            fraud_status: 'clean',
            fraud_score: 0,
            role: 'member',
            created_at: new Date(),
            updated_at: new Date(),
          };

          await membersCollection.insertOne(memberData);
          console.log('Member account created after successful payment:', orderId);
        } else {
          // Update existing member
          await membersCollection.updateOne(
            { email: formData.email.toLowerCase() },
            {
              $set: {
                membership_status: 'active',
                payment_status: 'paid',
                payment_amount: parseFloat(responseData.amount),
                payment_currency: 'AED',
                payment_date: new Date(),
                payment_session_id: orderId,
                updated_at: new Date(),
              }
            }
          );
          console.log('Existing member updated after successful payment:', orderId);
        }
      } catch (memberError) {
        console.error('Error creating member account:', memberError);
        // Continue even if member creation fails
      }

      // Send welcome email
      try {
        await sendWelcomeEmail(formData.email, formData.fullName, formData.membershipType);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }

      // Log audit
      await logAudit({
        userType: 'system',
        action: 'payment_completed',
        resourceType: 'payment',
        resourceId: orderId,
        details: {
          membershipType: formData.membershipType,
          amount: parseFloat(responseData.amount),
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    } else {
      // Payment failed - log but don't save data
      console.log('Payment failed for order:', orderId);
      await logAudit({
        userType: 'system',
        action: 'payment_failed',
        resourceType: 'payment',
        resourceId: orderId,
        details: {
          orderStatus: orderStatus,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    // Redirect to success or failure page
    const redirectUrl = orderStatus === 'Success'
      ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?order_id=${orderId}`
      : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?order_id=${orderId}`;

    res.json({
      success: orderStatus === 'Success',
      orderStatus,
      redirectUrl,
      orderId,
    });
  } catch (error) {
    console.error('Error processing payment response:', error);
    res.status(500).json({ error: 'Failed to process payment response' });
  }
});

export default router;

