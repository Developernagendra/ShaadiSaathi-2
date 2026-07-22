// ==================== AUTH ROUTES ====================
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, logout, verifyEmail, forgotPassword, resetPassword, getMe, changePassword, resendVerification, testEmail } = require('../controllers/authController');
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateForgotPassword } = require('../middleware/validate');

// Strict login-specific rate limiter — prevents brute-force credential stuffing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts from this IP. Please try again after 15 minutes.' },
});

// Strict limiter for password reset to prevent email enumeration / abuse
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset requests. Please try again after 15 minutes.' },
});

router.post('/register', validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.patch('/update-password', protect, changePassword);
router.get('/test-email', testEmail);

module.exports = router;
