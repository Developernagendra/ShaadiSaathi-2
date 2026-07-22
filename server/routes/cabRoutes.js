const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const {
  createCabBooking, getMyBookings, getVendorBookings, getBookingById, updateBookingStatus
} = require('../controllers/bookingController');
const { getCabs, getCabDetails, getBundleDetails } = require('../controllers/cabController');

// Public routes
router.get('/', getCabs);
router.get('/details/:id', getCabDetails);
router.get('/bundle/:bundleId', getBundleDetails);

// User Protected routes
router.post('/', protect, restrictTo('user'), verified, createCabBooking);
router.post('/book-bundle', protect, restrictTo('user'), verified, createCabBooking);
router.get('/my-bookings', protect, (req, res, next) => {
  req.query.bookingType = 'baraat-cab';
  getMyBookings(req, res, next);
});
router.get('/:id', protect, getBookingById);

// Vendor & Admin Protected routes
router.use(protect);
router.use(restrictTo('vendor', 'admin'));

router.get('/vendor-bookings', restrictToApproved, (req, res, next) => {
  req.query.bookingType = 'baraat-cab';
  getVendorBookings(req, res, next);
});
router.patch('/:id/status', restrictToApproved, updateBookingStatus);

module.exports = router;


