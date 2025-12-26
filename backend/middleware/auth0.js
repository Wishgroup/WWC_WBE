/**
 * Auth0 Authentication Middleware
 * Verifies Auth0 JWT tokens using JWKS endpoint
 */

import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

// Validate Auth0 environment variables
const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;
const auth0Issuer = process.env.AUTH0_ISSUER_BASE_URL || `https://${auth0Domain}/`;

if (!auth0Domain || !auth0Audience) {
  console.warn('Warning: AUTH0_DOMAIN and AUTH0_AUDIENCE must be set for Auth0 authentication');
}

/**
 * Middleware to verify Auth0 JWT tokens
 * Uses JWKS (JSON Web Key Set) to verify token signatures
 */
export const authenticateAuth0 = auth0Domain && auth0Audience
  ? jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      }),
      audience: auth0Audience,
      issuer: auth0Issuer,
      algorithms: ['RS256'],
      credentialsRequired: false, // Allow unauthenticated requests, but attach user if token is valid
    })
  : (req, res, next) => {
      // If Auth0 is not configured, skip authentication
      console.warn('Auth0 not configured - skipping authentication');
      next();
    };

/**
 * Middleware that requires authentication
 * Returns 401 if no valid token is provided
 */
export const requireAuth0 = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * Extract Auth0 user information from token
 * Attaches auth0_id, email, and other claims to req.user
 */
export const extractAuth0User = (req, res, next) => {
  if (req.user) {
    // Auth0 token structure: sub is the user ID (auth0|...)
    req.auth0User = {
      auth0_id: req.user.sub,
      email: req.user.email,
      email_verified: req.user.email_verified,
      name: req.user.name,
      nickname: req.user.nickname,
      picture: req.user.picture,
      // Custom claims from Auth0 metadata
      role: req.user[`${auth0Audience}/role`] || req.user.role,
      membership_type: req.user[`${auth0Audience}/membership_type`] || req.user.membership_type,
      user_type: req.user[`${auth0Audience}/user_type`] || req.user.user_type || 'member',
    };
  }
  next();
};

