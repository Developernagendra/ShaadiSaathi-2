const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { createReview, getVendorReviews, getCabReviews, updateReview, deleteReview, replyToReview, getVendorDashboardReviews, updateReviewStatus } = require('../controllers/reviewController');

router.post('/', protect, verified, createReview);
router.get('/dashboard', protect, restrictTo('vendor'), getVendorDashboardReviews);
router.get('/vendor/:vendorId', optionalAuth, getVendorReviews);
router.get('/cab/:cabId', optionalAuth, getCabReviews);

// Only the review author can update their own review (ownership checked in controller)
router.put('/:id', protect, verified, updateReview);

// Only admins can moderate review status (approve/reject/flag)
router.patch('/:id/status', protect, restrictTo('admin'), updateReviewStatus);

// Only the review author or an admin can delete a review (ownership checked in controller)
router.delete('/:id', protect, restrictTo('user', 'admin'), deleteReview);

router.post('/:id/reply', protect, restrictTo('vendor'), verified, replyToReview);

module.exports = router;
