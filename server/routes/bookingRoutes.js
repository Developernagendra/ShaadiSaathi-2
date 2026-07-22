const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { 
  createBooking, 
  getMyBookings, 
  getVendorBookings, 
  getAdminBookings,
  updateBookingStatus, 
  cancelBooking, 
  getBookingById,
  deleteBooking,
  getUserDashboard,
  getVendorServicesBookings,
  getVendorCabsBookings
} = require('../controllers/bookingController');

router.use(protect);

router.get('/user-dashboard', verified, getUserDashboard);
router.post('/', restrictTo('user'), verified, createBooking);
router.get('/my-bookings', verified, (req, res, next) => {
  req.query.bookingType = 'service';
  getMyBookings(req, res, next);
});
router.get('/vendor-bookings', restrictTo('vendor', 'admin'), restrictToApproved, getVendorBookings);
router.get('/vendor/services', restrictTo('vendor', 'admin'), restrictToApproved, getVendorServicesBookings);
router.get('/vendor/cabs', restrictTo('vendor', 'admin'), restrictToApproved, getVendorCabsBookings);
router.get('/vendor', restrictTo('vendor', 'admin'), restrictToApproved, getVendorBookings);
router.get('/admin-bookings', restrictTo('admin'), getAdminBookings);
router.get('/admin', restrictTo('admin'), getAdminBookings);
router.get('/:id', verified, getBookingById);
router.patch('/:id/status', restrictTo('vendor', 'admin'), verified, restrictToApproved, updateBookingStatus);
router.patch('/:id/cancel', verified, cancelBooking);
router.delete('/:id', restrictTo('admin', 'vendor'), deleteBooking);

module.exports = router;
