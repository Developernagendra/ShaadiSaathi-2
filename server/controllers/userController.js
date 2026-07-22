const User = require('../models/User');
const { deleteFromCloudinary } = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'businessName images basePrice location rating category')
    .lean();
    
  res.status(200).json({
    status: 'success',
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, weddingDate, weddingCity, notifications, preferredLanguage } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (phone) updateFields.phone = phone;
  if (weddingDate) updateFields.weddingDate = weddingDate;
  if (weddingCity) updateFields.weddingCity = weddingCity;
  if (notifications) updateFields.notifications = notifications;
  if (preferredLanguage) updateFields.preferredLanguage = preferredLanguage;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    user
  });
});

// @desc    Upload profile avatar
// @route   PUT /api/users/avatar
// @access  Private
const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image.', 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar if exists
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  user.avatar = {
    url: req.file.path,
    publicId: req.file.filename,
  };
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Avatar updated successfully.',
    avatar: user.avatar
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully.'
  });
});

// @desc    Add/update address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = catchAsync(async (req, res, next) => {
  const { label, street, city, state, pincode, isDefault } = req.body;
  const user = await User.findById(req.user._id);

  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  user.addresses.push({ 
    label, street, city, state, pincode, 
    isDefault: isDefault || user.addresses.length === 0 
  });
  await user.save();

  res.status(201).json({
    status: 'success',
    message: 'Address added successfully.',
    addresses: user.addresses
  });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );
  await user.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Address deleted.',
    addresses: user.addresses
  });
});

// @desc    Add/Remove from wishlist
// @route   POST /api/users/wishlist/:vendorId
// @access  Private
const toggleWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const vendorId = req.params.vendorId;

  const idx = user.wishlist.indexOf(vendorId);
  let message;

  if (idx === -1) {
    user.wishlist.push(vendorId);
    message = 'Added to wishlist.';
  } else {
    user.wishlist.splice(idx, 1);
    message = 'Removed from wishlist.';
  }

  await user.save();
  res.status(200).json({
    status: 'success',
    message,
    wishlist: user.wishlist
  });
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'businessName images basePrice location rating category badges isFeatured tagline');
  
  res.status(200).json({
    status: 'success',
    wishlist: user.wishlist
  });
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Admin
const getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    users,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
  });
});

// @desc    Toggle user status (Admin)
// @route   PATCH /api/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  if (user.role === 'admin') return next(new AppError('Cannot modify admin users.', 403));

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    isActive: user.isActive
  });
});

module.exports = {
  getProfile, updateProfile, uploadAvatar, deleteAccount,
  addAddress, deleteAddress, toggleWishlist, getWishlist,
  getAllUsers, toggleUserStatus,
};
