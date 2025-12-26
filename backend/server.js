/**
 * Wish Waves Club Backend Server
 * Enterprise Features: Fraud Detection, Multi-Country Rules, Dynamic Offers
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimiter.js';
import nfcRoutes from './routes/nfc.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import { logAudit } from './services/AuditService.js';

// Load environment variables
dotenv.config();

// Validate Auth0 environment variables
const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;

if (!auth0Domain || !auth0Audience) {
  console.warn('⚠️  Warning: AUTH0_DOMAIN and AUTH0_AUDIENCE not set. Auth0 authentication will not work.');
  console.warn('   Set these environment variables to enable Auth0 authentication.');
} else {
  console.log('✅ Auth0 configuration loaded');
  console.log(`   Domain: ${auth0Domain}`);
  console.log(`   Audience: ${auth0Audience}`);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Wish Waves Club Backend API',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nfc', nfcRoutes);
app.use('/api/admin', adminRoutes);

// Legacy email endpoint (for existing frontend)
app.post('/api/send-email', async (req, res) => {
  try {
    // Log the membership application
    await logAudit({
      userType: 'api',
      action: 'membership_application_submitted',
      resourceType: 'membership',
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Membership application received:', req.body);

    res.json({
      success: true,
      message: 'Application received successfully',
    });
  } catch (error) {
    console.error('Email endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle Auth0 JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token',
    });
  }

  console.error('Unhandled error:', err);
  
  logAudit({
    userType: 'system',
    action: 'server_error',
    details: {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Wish Waves Club Backend API                            ║
║   Enterprise Features Enabled                             ║
║                                                           ║
║   ✅ Fraud Detection Engine                               ║
║   ✅ Multi-Country Rules Engine                           ║
║   ✅ Dynamic Offers Engine                                ║
║   ✅ NFC Validation Pipeline                              ║
║   ✅ Card Lifecycle Management                            ║
║   ✅ Auth0 Authentication                                 ║
║                                                           ║
║   Server running on port ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}   ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;




