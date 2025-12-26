# Backend Architecture Generation Prompt

Create a production-ready Node.js/Express backend for **Wish Waves Club** following these exact patterns and architecture:

## Architecture Overview

Build a **modular monolith architecture** using Node.js and Express.js, where each feature is a **separate service module** with clear boundaries. Use **PostgreSQL** for persistence with connection pooling. Implement **JWT and API key authentication** with shared middleware patterns. Design for **ML-ready fraud detection** and **event-driven extensibility**.

## Repository Structure

Create the following structure:

```
project-root/
├── backend/
│ ├── package.json
│ ├── server.js (main entry point)
│ ├── .env.example
│ ├── .gitignore
│ ├── database/
│ │ ├── connection.js (PostgreSQL pool)
│ │ └── schema.sql (complete schema with indexes)
│ ├── services/
│ │ ├── FraudDetectionEngine.js
│ │ ├── CountryRuleEngine.js
│ │ ├── OfferEngine.js
│ │ ├── NFCValidationPipeline.js
│ │ ├── NFCCardService.js
│ │ └── AuditService.js
│ ├── middleware/
│ │ ├── auth.js (JWT, API key verification)
│ │ └── rateLimiter.js (express-rate-limit)
│ ├── routes/
│ │ ├── nfc.js (vendor POS endpoints)
│ │ └── admin.js (admin dashboard endpoints)
│ ├── scripts/
│ │ ├── migrate.js (database migration)
│ │ ├── seed-sample-data.js (test data)
│ │ └── test-setup.js (setup verification)
│ └── examples/
│   ├── integration-example.js (integration patterns)
│   └── test-api.sh (API testing script)
├── README.md
├── SETUP.md
├── QUICK_START.md
└── IMPLEMENTATION_SUMMARY.md
```

## Service Design Patterns

### 1. Main Server Pattern (server.js)

The main server file should:
- Load environment configuration using `dotenv`
- Initialize Express with security middleware (Helmet, CORS)
- Set up request logging middleware
- Configure global rate limiting
- Wire route handlers
- Start HTTP server with graceful shutdown
- Handle errors with centralized error handler

Example structure:
```javascript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimiter.js';
import nfcRoutes from './routes/nfc.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Global rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/nfc', nfcRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Layered Architecture

**Routes Layer** (`routes/`):
- Thin route handlers that validate input
- Call service layer functions
- Handle HTTP status codes and responses
- Apply authentication middleware where needed

**Services Layer** (`services/`):
- Business logic only (no HTTP, minimal database details)
- Each service is a class or module with clear responsibilities
- Accept parameters, return results or throw errors
- Stateless and testable

**Database Layer** (`database/`):
- Connection pooling with `pg` (PostgreSQL)
- Query helpers with parameterized queries (SQL injection prevention)
- Transaction support
- Schema migrations

### 3. Configuration Pattern

Use environment variables with sensible defaults:

```javascript
// .env.example
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wwc_db
DB_USER=wwc_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
NFC_ENCRYPTION_KEY=your_nfc_encryption_key_32_bytes
ADMIN_API_KEY=your_admin_api_key_secure_random
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRAUD_SCORE_LOW=30
FRAUD_SCORE_MEDIUM=60
FRAUD_SCORE_HIGH=90
```

Load with `dotenv`:
```javascript
import dotenv from 'dotenv';
dotenv.config();
```

### 4. Service Module Pattern

Each service should be:
- **Self-contained**: All related logic in one file
- **Configurable**: Accepts configuration via constructor or parameters
- **Testable**: Pure functions or dependency injection
- **Documented**: JSDoc comments explaining purpose and usage

Example service structure:
```javascript
/**
 * Service Name
 * Purpose and description
 */
import { query } from '../database/connection.js';

class ServiceName {
  constructor() {
    this.config = {
      // Configuration from environment
    };
  }

  /**
   * Main method description
   * @param {Object} data - Input data
   * @returns {Object} Result
   */
  async mainMethod(data) {
    try {
      // Business logic
      // Database queries
      // Return result
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}

export default new ServiceName();
```

### 5. Authentication & Authorization

**Shared Auth Middleware** (`middleware/auth.js`):
- JWT verification for admin endpoints
- API key verification for vendor endpoints
- Extract user context (userId, role, vendorId)
- Pass context to route handlers via `req.user` or `req.vendor`

**Pattern**:
```javascript
// JWT Authentication
export const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// API Key Authentication
export const authenticateVendor = async (req, res, next) => {
  const apiKey = req.headers['x-vendor-api-key'];
  // Verify against database
  req.vendor = vendorData;
  next();
};
```

**RBAC**:
- Extract roles from JWT claims
- Enforce at middleware level
- Pass user context through to services

### 6. Database Pattern

**PostgreSQL with Connection Pooling**:
- Use `pg` library with connection pooling
- Parameterized queries (prevent SQL injection)
- Transaction support for atomic operations
- Proper indexing for performance

**Pattern**:
```javascript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
});

export const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

**Schema Design**:
- Use `SERIAL` for auto-incrementing IDs
- Use `TIMESTAMP` for created_at/updated_at
- Use `JSONB` for flexible data structures
- Create indexes on foreign keys and frequently queried columns
- Use `ON DELETE CASCADE` where appropriate

### 7. Observability

**Logging**:
- Use `console.log` with structured format
- Include: timestamp, service, level, message, context
- Log errors with stack traces in development
- Log important business events

**Pattern**:
```javascript
console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
console.error('Error:', error.message, { context: additionalData });
```

**Health Checks**:
- `/health` endpoint: Always returns 200 when server is running
- Include service name, version, timestamp

**Metrics** (Future):
- Prometheus metrics endpoint at `/metrics`
- Track: request count, error rate, response time, business metrics

### 8. Security Patterns

**Input Validation**:
- Validate all input at route level
- Use `express-validator` for complex validation
- Sanitize user input
- Reject malformed requests early

**Rate Limiting**:
- Global rate limiting on `/api` routes
- Stricter limits on sensitive endpoints (NFC validation)
- Configurable via environment variables

**SQL Injection Prevention**:
- Always use parameterized queries
- Never concatenate user input into SQL strings

**Authentication**:
- Secure token storage (environment variables)
- Token expiration
- API key rotation capability

### 9. Error Handling

**Pattern**:
- Services throw errors with meaningful messages
- Routes catch errors and convert to HTTP status codes
- Centralized error handler logs errors
- Don't expose internal errors to clients

```javascript
// In service
if (!data) {
  throw new Error('Data not found');
}

// In route
try {
  const result = await service.method(data);
  res.json({ success: true, data: result });
} catch (error) {
  if (error.message === 'Data not found') {
    return res.status(404).json({ error: error.message });
  }
  res.status(500).json({ error: 'Internal server error' });
}
```

### 10. Testing & Development Tools

**Scripts** (`scripts/`):
- `migrate.js`: Database migration script
- `seed-sample-data.js`: Create test data
- `test-setup.js`: Verify setup and configuration

**Examples** (`examples/`):
- `integration-example.js`: Show how to integrate with frontend
- `test-api.sh`: API testing script

## Implementation Requirements

1. **Service Boundaries**: Each service module has clear responsibilities. Services can call each other but maintain loose coupling.

2. **Error Handling**:
   - Return errors from services
   - Convert to HTTP status codes in routes
   - Log errors with context
   - Don't expose internal errors to clients

3. **Versioning**: All APIs under `/api/` prefix (future: `/api/v1/`)

4. **Code Quality**:
   - ES6 modules (import/export)
   - Async/await for asynchronous operations
   - JSDoc comments for public methods
   - No global state
   - Context propagation for cancellation (where applicable)

5. **Database**:
   - All queries use parameterized statements
   - Transactions for multi-step operations
   - Proper indexes for performance
   - Migration scripts for schema changes

## Specific Service Requirements

For **Wish Waves Club**, implement the following services:

1. **FraudDetectionEngine** (`services/FraudDetectionEngine.js`)
   - Detects card sharing, cloning, geo-inconsistencies
   - Fraud scoring system (Low/Medium/High)
   - ML-ready architecture
   - Configurable thresholds

2. **CountryRuleEngine** (`services/CountryRuleEngine.js`)
   - Country-specific business rules
   - Blackout periods
   - Discount caps
   - Config-driven (database)

3. **OfferEngine** (`services/OfferEngine.js`)
   - Real-time personalized offers
   - Multiple offer types
   - Usage limits
   - Priority-based selection

4. **NFCValidationPipeline** (`services/NFCValidationPipeline.js`)
   - Strict validation order
   - Orchestrates all engines
   - Complete audit trail

5. **NFCCardService** (`services/NFCCardService.js`)
   - Card lifecycle management
   - Encryption/decryption
   - UID blacklisting

6. **AuditService** (`services/AuditService.js`)
   - Comprehensive audit logging
   - Fraud event creation
   - Queryable audit logs

## Deliverables

1. Complete repository structure with all files
2. Working `package.json` with all dependencies
3. Database schema with migrations
4. All service modules implemented
5. Route handlers for all endpoints
6. Authentication middleware working
7. Rate limiting configured
8. Health check endpoint
9. Setup scripts (migrate, seed, test-setup)
10. Comprehensive documentation (README, SETUP, QUICK_START)

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 12+
- **ORM/Query**: pg (native PostgreSQL driver)
- **Security**: Helmet, CORS, express-rate-limit
- **Authentication**: jsonwebtoken, bcryptjs
- **Config**: dotenv
- **Logging**: console (structured format)
- **Containerization**: Docker (optional)

## Key Architectural Decisions

1. **Modular Monolith**: Services are modules, not separate processes. Easier to deploy and maintain while keeping clear boundaries.

2. **PostgreSQL over MongoDB**: Better for relational data, ACID transactions, complex queries, and fraud detection analytics.

3. **Connection Pooling**: Reuse database connections for performance.

4. **Stateless Services**: All services are stateless for horizontal scaling.

5. **Event-Driven Ready**: Architecture supports future event-driven communication (Kafka/RabbitMQ) without major refactoring.

6. **ML-Ready**: Fraud detection structured for future ML model integration.

## Generate the complete backend following these exact patterns and conventions.

Replace `[YOUR_FRONTEND_APPLICATION]` with **Wish Waves Club** and implement all services listed above.


