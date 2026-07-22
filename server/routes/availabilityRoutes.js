const express = require('express');
const availabilityController = require('../controllers/availabilityController');
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for users to see vendor availability
router.get('/vendors/:id', availabilityController.getPublicAvailability);

// Protected routes for vendors
router.use(protect);
router.use(restrictTo('vendor', 'admin'));

router.get('/vendor', availabilityController.getVendorAvailability);
router.post('/', availabilityController.updateAvailability);
router.post('/bulk', availabilityController.bulkUpdateAvailability);
router.delete('/:id', availabilityController.deleteAvailability);

module.exports = router;
