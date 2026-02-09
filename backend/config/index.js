/**
 * Environment-based configuration
 * Single source of truth for app config (dev/prod).
 */

const trim = (v) => (typeof v === 'string' ? v.trim() : v);

const config = {
  env: trim(process.env.NODE_ENV) || 'development',
  isDev: (trim(process.env.NODE_ENV) || 'development') === 'development',
  isProd: trim(process.env.NODE_ENV) === 'production',

  server: {
    port: parseInt(trim(process.env.PORT) || '3001', 10),
    host: trim(process.env.HOST) || '0.0.0.0',
  },

  db: {
    host: trim(process.env.DB_HOST) || 'localhost',
    port: parseInt(trim(process.env.DB_PORT) || '3306', 10),
    name: trim(process.env.DB_NAME) || 'wwc_db',
    user: trim(process.env.DB_USER) || 'root',
    password: trim(process.env.DB_PASSWORD) ?? '',
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    secret: trim(process.env.JWT_SECRET) || 'dev_jwt_secret_change_in_production',
    expiresIn: trim(process.env.JWT_EXPIRES_IN) || '7d',
  },

  rateLimit: {
    windowMs: parseInt(trim(process.env.RATE_LIMIT_WINDOW_MS) || '900000', 10),
    max: parseInt(trim(process.env.RATE_LIMIT_MAX_REQUESTS) || '100', 10),
    nfcWindowMs: 60 * 1000,
    nfcMax: 60,
  },

  frontend: {
    url: trim(process.env.FRONTEND_URL) || 'http://localhost:5173',
  },

  admin: {
    apiKey: trim(process.env.ADMIN_API_KEY) || 'dev_admin_api_key_change_in_production',
  },
};

export default config;
