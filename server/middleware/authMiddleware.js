const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid. User not found.' });
    }
    
    // Check if user changed password after token was issued
    const mongooseUser = await User.findById(decoded.id);
    if (mongooseUser && mongooseUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: 'User recently changed password! Please log in again.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated. Contact support.' });
    }

    // Removed global isVerified check. 
    // Verification gating is now explicitly handled by the 'verified' middleware.

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    return res.status(500).json({ message: 'Server error in authentication.' });
  }
};

// Role-based authorization
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const mongooseUser = await User.findById(decoded.id);
      if (mongooseUser && !mongooseUser.changedPasswordAfter(decoded.iat)) {
        req.user = mongooseUser.toObject(); // Convert to lean-like object
      }
    }
    next();
  } catch {
    next();
  }
};

// Approval-based authorization for vendors
const restrictToApproved = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const Vendor = mongoose.model('Vendor');

    // Admins have full access
    if (req.user.role === 'admin') return next();

    // Find vendor profile associated with this user
    const vendor = await Vendor.findOne({ user: req.user._id }).lean();

    if (!vendor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Vendor profile not found. Please complete your business registration first.'
      });
    }

    // Attach vendor to request for use in controllers
    req.vendor = vendor;

    // In development or local environments, auto-approve vendor dashboard access to avoid testing blocks
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
      return next();
    }

    // Normalize and check status (trim/lowercase to be safe)
    const status = (vendor.approvalStatus || 'pending').toLowerCase().trim();

    if (status === 'approved') {
      return next();
    }

    if (status === 'pending') {
      return res.status(403).json({
        status: 'pending',
        message: 'Access denied. Your vendor account is still pending admin approval.'
      });
    }

    if (status === 'rejected') {
      return res.status(403).json({
        status: 'rejected',
        message: 'Access denied. Your vendor application was rejected.'
      });
    }

    if (status === 'suspended') {
      return res.status(403).json({
        status: 'suspended',
        message: 'Access denied. Your account is currently suspended. Please contact support.'
      });
    }

    // Default fallback
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied. Your account is not approved for this action.'
    });
  } catch (error) {
    console.error('RESTRICT_TO_APPROVED_ERROR:', error);
    return res.status(500).json({ message: 'Internal server error during authorization.' });
  }
};

// Email verification gate
const verified = (req, res, next) => {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied. Please verify your email address to unlock this feature.',
    });
  }
  next();
};

const adminOnly = restrictTo('admin');
const vendorOnly = restrictTo('vendor');
const userOnly = restrictTo('user');

module.exports = { 
  protect, 
  restrictTo, 
  adminOnly, 
  vendorOnly, 
  userOnly, 
  optionalAuth, 
  restrictToApproved, 
  verified 
};
