/**
 * Centralized Logger Utility — ShaadiSaathi
 * 
 * Purpose:
 * - Consistent, timestamped log output for SMTP, auth, booking, and JWT events
 * - Sanitizes sensitive data so tokens, passwords, and keys never appear in logs
 * - Provides a clean API response helper that never exposes internals to clients
 */

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'pass', 'jwt', 'auth', 'credential'];

/**
 * Sanitize an object to remove sensitive keys before logging.
 */
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk));
    clean[k] = isSensitive ? '[REDACTED]' : (typeof v === 'object' ? sanitize(v) : v);
  }
  return clean;
};

const timestamp = () => new Date().toISOString();

const logger = {
  /**
   * General information log
   */
  info: (module, message, data = null) => {
    const prefix = `[${timestamp()}] [INFO] [${module}]`;
    if (data) {
      console.log(`${prefix} ${message}`, sanitize(data));
    } else {
      console.log(`${prefix} ${message}`);
    }
  },

  /**
   * Warning log — non-critical issues
   */
  warn: (module, message, data = null) => {
    const prefix = `[${timestamp()}] [WARN] [${module}]`;
    if (data) {
      console.warn(`${prefix} ${message}`, sanitize(data));
    } else {
      console.warn(`${prefix} ${message}`);
    }
  },

  /**
   * Error log — always includes error message, never exposes stack traces to clients
   */
  error: (module, message, err = null) => {
    const prefix = `[${timestamp()}] [ERROR] [${module}]`;
    if (err) {
      console.error(`${prefix} ${message}`);
      console.error(`${prefix}   → Code   : ${err.code || 'UNKNOWN'}`);
      console.error(`${prefix}   → Message: ${err.message || String(err)}`);
      // Only log stack trace in non-production to keep production logs clean
      if (process.env.NODE_ENV !== 'production' && err.stack) {
        console.error(`${prefix}   → Stack  : ${err.stack.split('\n')[1] || ''}`);
      }
    } else {
      console.error(`${prefix} ${message}`);
    }
  },

  /**
   * SMTP-specific log
   */
  smtp: (level, message, details = {}) => {
    const prefix = `[${timestamp()}] [${level.toUpperCase()}] [SMTP]`;
    console.log(`${prefix} ${message}`, details);
  },

  /**
   * Auth-specific log
   */
  auth: (level, message, userEmail = null) => {
    const prefix = `[${timestamp()}] [${level.toUpperCase()}] [AUTH]`;
    const suffix = userEmail ? ` → User: ${userEmail}` : '';
    console.log(`${prefix} ${message}${suffix}`);
  },

  /**
   * Booking-specific log
   */
  booking: (level, message, bookingId = null) => {
    const prefix = `[${timestamp()}] [${level.toUpperCase()}] [BOOKING]`;
    const suffix = bookingId ? ` → BookingID: ${bookingId}` : '';
    console.log(`${prefix} ${message}${suffix}`);
  },

  /**
   * Clean API error response — never exposes stack traces or internal error messages to clients
   */
  apiError: (res, statusCode, userFacingMessage) => {
    return res.status(statusCode).json({
      success: false,
      status: 'error',
      message: userFacingMessage,
    });
  },
};

module.exports = logger;
