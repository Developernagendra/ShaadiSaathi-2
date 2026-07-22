const express = require('express');
const router = express.Router();
const packageInquiryController = require('../controllers/packageInquiryController');
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');

router.route('/')
  .post(packageInquiryController.submitInquiry)
  .get(protect, restrictTo('admin'), packageInquiryController.getInquiries);

router.route('/:id')
  .put(protect, restrictTo('admin'), packageInquiryController.updateInquiry)
  .delete(protect, restrictTo('admin'), packageInquiryController.deleteInquiry);

module.exports = router;
