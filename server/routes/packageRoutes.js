const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');

router.route('/')
  .get(packageController.getPackages)
  .post(protect, restrictTo('admin'), packageController.createPackage);

router.route('/:id')
  .get(packageController.getPackage)
  .put(protect, restrictTo('admin'), packageController.updatePackage)
  .delete(protect, restrictTo('admin'), packageController.deletePackage);

module.exports = router;
