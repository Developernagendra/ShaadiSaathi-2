const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { uploadService } = require('../config/cloudinary');
const { Service } = require('../models/index');
const Vendor = require('../models/Vendor');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

router.get('/', catchAsync(async (req, res, next) => {
  console.time('getServices-Fetch');
  const { page = 1, limit = 12, city, category, categorySlug, minPrice, maxPrice, search, sortBy = 'createdAt' } = req.query;
  const query = { isActive: true, status: 'approved' };

  if (city) query.city = { $regex: city, $options: 'i' };

  if (categorySlug) {
    const Category = require('mongoose').model('Category');
    const searchSlug = categorySlug.toLowerCase();

    // Alias mapping to resolve frontend category mismatches
    const slugMap = {
      'fleet': 'cab-service',
      'baraat-cabs': 'cab-service',
      'wedding-services': 'wedding-planner',
      'tents': 'tent-house',
      'venues': 'venue'
    };

    const mappedSlug = slugMap[searchSlug] || searchSlug;
    const cat = await Category.findOne({ slug: mappedSlug }).lean();

    if (cat) {
      query.category = cat._id;
    } else {
      // If slug doesn't exist even after mapping, return empty results safely
      query.category = new (require('mongoose').Types.ObjectId)();
    }
  } else if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.startingPrice = {};
    if (minPrice) query.startingPrice.$gte = Number(minPrice);
    if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
  }

  if (search) query.$text = { $search: search };

  // Strict Vendor Validation: Ensure the parent vendor is also approved and active.
  const activeVendors = await Vendor.find({ approvalStatus: 'approved', isActive: true }).select('_id');
  const validVendorIds = activeVendors.map(v => v._id);
  query.vendor = { $in: validVendorIds };

  const sortOptions = {};
  if (sortBy === 'price_asc') sortOptions.startingPrice = 1;
  else if (sortBy === 'price_desc') sortOptions.startingPrice = -1;
  else if (sortBy === 'rating') sortOptions['rating.average'] = -1;
  else sortOptions.createdAt = -1;

  const total = await Service.countDocuments(query);
  const services = await Service.find(query)
    .populate('vendor', 'businessName location rating images approvalStatus')
    .populate('category', 'name slug icon')
    .sort(sortOptions)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  console.timeEnd('getServices-Fetch');
  console.log('PUBLIC SERVICES FETCHED');

  res.status(200).json({
    status: 'success',
    results: services.length,
    services,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @desc    Get vendor's own services
// @route   GET /api/services/my-services
router.get('/my-services', protect, restrictTo('vendor', 'admin'), verified, catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, vendorId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let queryVendorId;
  if (req.user.role === 'admin' && vendorId) {
    queryVendorId = vendorId;
  } else {
    const vendor = await Vendor.findOne({ user: req.user._id }).select('_id');
    if (!vendor) return next(new AppError('Vendor profile not found.', 404));
    queryVendorId = vendor._id;
  }

  const total = await Service.countDocuments({ vendor: queryVendorId });
  const services = await Service.find({ vendor: queryVendorId })
    .populate('category', 'name icon')
    .select('title category description startingPrice city duration coverImage images isActive status createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.status(200).json({
    success: true,
    status: 'success',
    results: services.length,
    services,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit)
    }
  });
}));

// @desc    Get service by ID
// @route   GET /api/services/:id
router.get('/:id', optionalAuth, catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    .populate('vendor', 'businessName location rating images phone email socialLinks yearsOfExperience badges responseTime user approvalStatus isActive')
    .populate('category', 'name slug');

  if (!service) return next(new AppError('Service not found.', 404));

  let isAuthorized = false;
  if (req.user) {
    if (req.user.role === 'admin') {
      isAuthorized = true;
    } else if (req.user._id.toString() === service.vendor?.user?.toString() || req.user._id.toString() === service.vendor?.user?._id?.toString()) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized && process.env.NODE_ENV !== 'development') {
    // Check if service itself is active and approved
    if (service.status !== 'approved' || service.isActive === false) {
      return next(new AppError('This service is not available publicly.', 404));
    }
    // Also check if the parent vendor is active and approved
    if (service.vendor && (service.vendor.approvalStatus !== 'approved' || service.vendor.isActive === false)) {
      return next(new AppError('This service belongs to a vendor profile that is currently unavailable.', 404));
    }
  }

  res.status(200).json({ status: 'success', service });
}));

// @desc    Create new service
// @route   POST /api/services
router.post('/', protect, restrictTo('vendor', 'admin'), verified, restrictToApproved, uploadService.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 2 }
]), catchAsync(async (req, res, next) => {
  const images = req.files['images']?.map((f) => ({ url: f.path, publicId: f.filename })) || [];
  const videos = req.files['videos']?.map((f) => ({ url: f.path, publicId: f.filename })) || [];

  // Parse JSON fields
  let { packages, features, vendorId, coverImageIndex, category } = req.body;
  if (typeof packages === 'string') packages = JSON.parse(packages);
  if (typeof features === 'string') features = JSON.parse(features);

  console.log('CATEGORY RECEIVED:', category);

  if (!category) {
    return next(new AppError('Category is required.', 400));
  }

  if (!require('mongoose').Types.ObjectId.isValid(category)) {
    return next(new AppError('Invalid category ID format.', 400));
  }

  const Category = require('mongoose').model('Category');
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError('Selected Category does not exist in the database.', 400));
  }

  let targetVendorId;
  if (req.user.role === 'admin' && vendorId) {
    targetVendorId = vendorId;
  } else {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return next(new AppError('Vendor profile not found', 404));
    targetVendorId = vendor._id;
  }

  const cvIdx = coverImageIndex !== undefined ? Number(coverImageIndex) : 0;
  const coverImage = images.length > 0 ? (images[cvIdx]?.url || images[0].url) : req.body.coverImage;

  const service = await Service.create({
    ...req.body,
    category,
    vendor: targetVendorId,
    images,
    coverImage,
    videos,
    packages,
    features,
    status: 'pending'
  });

  console.log('SERVICE CREATED');
  console.log('SERVICE SAVED');
  console.log('CATEGORY SAVED:', service.category);
  console.log('CATEGORY POPULATED:', service.category);
  console.log('SERVICE CATEGORY:', service.category);

  // Link category to vendor profile if vendor has no category
  try {
    const vendorProfile = await Vendor.findById(targetVendorId);
    if (vendorProfile && !vendorProfile.category) {
      vendorProfile.category = service.category;
      await vendorProfile.save({ validateBeforeSave: false });
      console.log('LINKED VENDOR CATEGORY DURING ADD SERVICE:', service.category);
    }
  } catch (vendorErr) {
    console.error('Failed to link category to vendor profile:', vendorErr);
  }

  try {
    const { sendNotification } = require('../services/notificationService');
    const { User } = require('../models/index');

    // Notify Admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await sendNotification({
        recipient: admin._id,
        sender: req.user._id,
        type: 'system',
        title: 'New Service Submitted',
        message: `Vendor "${req.user.name}" submitted a new service: "${service.title}".`,
        link: `/admin/services/pending/${service._id}`
      });
    }

    // Notify Vendor
    await sendNotification({
      recipient: req.user._id,
      sender: req.user._id,
      type: 'system',
      title: 'Service submitted successfully.',
      message: 'Waiting for admin approval.',
      link: '/vendor/dashboard/services'
    });
  } catch (err) {
    console.error('Notification dispatch error during service creation:', err);
  }

  const populatedService = await Service.findById(service._id).populate('category', 'name icon');
  res.status(201).json({ success: true, status: 'success', message: 'Service created successfully.', service: populatedService });
}));

// @desc    Update service
// @route   PUT /api/services/:id
router.put('/:id', protect, restrictTo('vendor', 'admin'), verified, restrictToApproved, uploadService.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 2 }
]), catchAsync(async (req, res, next) => {
  const query = { _id: req.params.id };
  if (req.user.role !== 'admin') {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return next(new AppError('Vendor profile not found', 404));
    query.vendor = vendor._id;
  }

  const service = await Service.findOne(query);
  if (!service) return next(new AppError('Service not found or unauthorized.', 404));

  const updateData = { ...req.body };

  // Parse JSON fields if they are strings
  if (typeof req.body.packages === 'string') updateData.packages = JSON.parse(req.body.packages);
  if (typeof req.body.features === 'string') updateData.features = JSON.parse(req.body.features);

  // Handle existing media sync if sent from frontend
  if (req.body.existingImages) {
    updateData.images = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
  } else {
    updateData.images = updateData.images || [];
  }
  if (req.body.existingVideos) {
    updateData.videos = typeof req.body.existingVideos === 'string' ? JSON.parse(req.body.existingVideos) : req.body.existingVideos;
  } else {
    updateData.videos = updateData.videos || [];
  }

  // Handle new uploads
  if (req.files) {
    if (req.files['images']) {
      const newImages = req.files['images'].map((f) => ({ url: f.path, publicId: f.filename }));
      updateData.images = [...updateData.images, ...newImages];
    }
    if (req.files['videos']) {
      const newVideos = req.files['videos'].map((f) => ({ url: f.path, publicId: f.filename }));
      updateData.videos = [...updateData.videos, ...newVideos];
    }
  }

  // Cleanup orphaned files from Cloudinary
  const oldImages = service.images || [];
  const newImagesList = updateData.images || [];
  const deletedImages = oldImages.filter(oldImg => oldImg.publicId && !newImagesList.some(newImg => newImg.publicId === oldImg.publicId));
  for (const img of deletedImages) {
    try {
      const { deleteFromCloudinary } = require('../config/cloudinary');
      await deleteFromCloudinary(img.publicId);
      console.log(`🧹 Cleaned up orphaned Cloudinary image: ${img.publicId}`);
    } catch (err) {
      console.error(`Failed to delete orphaned Cloudinary image ${img.publicId}:`, err);
    }
  }

  const oldVideos = service.videos || [];
  const newVideosList = updateData.videos || [];
  const deletedVideos = oldVideos.filter(oldVid => oldVid.publicId && !newVideosList.some(newVid => newVid.publicId === oldVid.publicId));
  for (const vid of deletedVideos) {
    try {
      const { deleteFromCloudinary } = require('../config/cloudinary');
      await deleteFromCloudinary(vid.publicId);
      console.log(`🧹 Cleaned up orphaned Cloudinary video: ${vid.publicId}`);
    } catch (err) {
      console.error(`Failed to delete orphaned Cloudinary video ${vid.publicId}:`, err);
    }
  }

  Object.assign(service, updateData);
  service.status = 'pending'; // Requires re-moderation

  // Sync cover image using coverImageIndex
  const cvIdx = req.body.coverImageIndex !== undefined ? Number(req.body.coverImageIndex) : 0;
  if (service.images?.length > 0) {
    service.coverImage = service.images[cvIdx]?.url || service.images[0].url;
  }

  await service.save();

  try {
    const { sendNotification } = require('../services/notificationService');
    const { User } = require('../models/index');

    // Notify Admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await sendNotification({
        recipient: admin._id,
        sender: req.user._id,
        type: 'system',
        title: 'Service Listing Updated',
        message: `Vendor "${req.user.name}" updated their service "${service.title}", awaiting review.`,
        link: '/admin/services/pending'
      });
    }

    // Notify Vendor
    await sendNotification({
      recipient: req.user._id,
      sender: req.user._id,
      type: 'system',
      title: 'Service Listing Updated',
      message: `Your service "${service.title}" has been updated and is pending moderation.`,
      link: '/vendor/dashboard/services'
    });
  } catch (err) {
    console.error('Notification dispatch error during service update:', err);
  }

  const populatedService = await Service.findById(service._id).populate('category', 'name icon');
  res.status(200).json({ success: true, status: 'success', message: 'Service updated successfully.', service: populatedService });
}));

// @desc    Delete service
// @route   DELETE /api/services/:id
router.delete('/:id', protect, restrictTo('vendor', 'admin'), verified, restrictToApproved, catchAsync(async (req, res, next) => {
  const query = { _id: req.params.id };
  if (req.user.role !== 'admin') {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return next(new AppError('Vendor profile not found', 404));
    query.vendor = vendor._id;
  }

  const service = await Service.findOneAndDelete(query);
  if (!service) return next(new AppError('Service not found or unauthorized.', 404));

  res.status(200).json({ status: 'success', message: 'Service deleted successfully.' });
}));

module.exports = router;
