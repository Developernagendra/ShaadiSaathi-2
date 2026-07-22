// userRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../config/cloudinary');
const {
  getProfile, updateProfile, uploadAvatar, deleteAccount,
  addAddress, deleteAddress, toggleWishlist, getWishlist,
  getAllUsers, toggleUserStatus,
} = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, verified, updateProfile);
router.put('/avatar', protect, verified, uploadProfile.single('avatar'), uploadAvatar);
router.delete('/account', protect, verified, deleteAccount);
router.post('/addresses', protect, verified, addAddress);
router.delete('/addresses/:addressId', protect, verified, deleteAddress);
router.post('/wishlist/:vendorId', protect, verified, toggleWishlist);
router.get('/wishlist', protect, verified, getWishlist);
router.get('/', protect, restrictTo('admin'), getAllUsers);
router.patch('/:id/toggle-status', protect, restrictTo('admin'), toggleUserStatus);

module.exports = router;
