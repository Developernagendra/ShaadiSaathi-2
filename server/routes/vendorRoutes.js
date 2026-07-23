const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { uploadService } = require('../config/cloudinary');
const AppError = require('../utils/appError');
const {
  createVendorProfile, getMyVendorProfile, updateVendorProfile,
  uploadVendorImages, deleteVendorImage, uploadVendorCoverImage, getAllVendors, getVendorById,
  updateVendorApproval, getVendorDashboard, updateAvailability, getFeaturedVendors, activateSubscription, getVendorContact
} = require('../controllers/vendorController');
const { getVendorBlogs, saveVendorBlog, deleteVendorBlog } = require('../controllers/vendorBlogController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

router.get('/', optionalAuth, getAllVendors);
router.get('/featured', cacheMiddleware(300), getFeaturedVendors);
router.get('/profile', protect, getMyVendorProfile);
router.get('/services', protect, restrictTo('vendor', 'admin'), async (req, res, next) => {
  try {
    const { Service, Vendor } = require('../models/index');
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Find the Vendor profile for the logged in user
    const vendorProfile = await Vendor.findOne({ user: req.user._id });
    const vendorIds = [req.user._id];
    if (vendorProfile) {
      vendorIds.push(vendorProfile._id);
    }

    const total = await Service.countDocuments({ vendor: { $in: vendorIds } });
    const services = await Service.find({
      vendor: { $in: vendorIds }
    })
      .select('title startingPrice city duration coverImage images category status isActive createdAt description rating')
      .populate('category', 'name icon')
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
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', protect, restrictTo('vendor', 'admin'), getVendorDashboard);
router.get('/:id', optionalAuth, getVendorById);
router.get('/:id/contact', protect, getVendorContact);
router.post('/', protect, createVendorProfile);
router.put('/profile', protect, restrictTo('vendor', 'admin'), updateVendorProfile);
router.put('/cab-pricing', protect, restrictTo('vendor', 'admin'), async (req, res, next) => {
  const Vendor = require('../models/Vendor');
  let vendor;
  if (req.user.role === 'admin' && req.query.vendorId) {
    vendor = await Vendor.findById(req.query.vendorId);
  } else {
    vendor = await Vendor.findOne({ user: req.user._id });
  }
  if (!vendor) return next(new AppError('Vendor not found', 404));
  vendor.cabPricing = req.body.cabPricing;
  await vendor.save();
  res.status(200).json({ status: 'success', cabPricing: vendor.cabPricing });
});
router.post('/images', protect, restrictTo('vendor', 'admin'), uploadService.array('images', 10), uploadVendorImages);
router.post('/cover-image', protect, restrictTo('vendor', 'admin'), uploadService.single('coverImage'), uploadVendorCoverImage);
router.post('/video', protect, restrictTo('vendor', 'admin'), verified, uploadService.single('video'), async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload a video.', 400));
  const Vendor = require('../models/Vendor');
  let vendor;
  if (req.user.role === 'admin' && req.query.vendorId) {
    vendor = await Vendor.findById(req.query.vendorId);
  } else {
    vendor = await Vendor.findOne({ user: req.user._id });
  }
  if (!vendor) return next(new AppError('Vendor not found', 404));

  if (vendor.video?.publicId) {
    const { deleteFromCloudinary } = require('../config/cloudinary');
    await deleteFromCloudinary(vendor.video.publicId);
  }

  vendor.video = { url: req.file.path, publicId: req.file.filename };
  await vendor.save();
  res.status(200).json({ status: 'success', video: vendor.video });
});
router.delete('/images/:imageId', protect, restrictTo('vendor', 'admin'), verified, deleteVendorImage);
router.delete('/video', protect, restrictTo('vendor', 'admin'), verified, async (req, res) => {
  const Vendor = require('../models/Vendor');
  let vendor;
  if (req.user.role === 'admin' && req.query.vendorId) {
    vendor = await Vendor.findById(req.query.vendorId);
  } else {
    vendor = await Vendor.findOne({ user: req.user._id });
  }
  if (vendor?.video?.publicId) {
    const { deleteFromCloudinary } = require('../config/cloudinary');
    await deleteFromCloudinary(vendor.video.publicId);
    vendor.video = undefined;
    await vendor.save();
  }
  res.status(200).json({ status: 'success' });
});

// Leads pipeline
const { getVendorLeadsPipeline, updateLeadPipelineStatus } = require('../controllers/vendorController');
router.get('/leads/pipeline', protect, restrictTo('vendor', 'admin'), getVendorLeadsPipeline);
router.patch('/leads/:id/status', protect, restrictTo('vendor', 'admin'), updateLeadPipelineStatus);

// Blog management
router.get('/blogs', protect, restrictTo('vendor', 'admin'), getVendorBlogs);
router.post('/blogs', protect, restrictTo('vendor', 'admin'), saveVendorBlog);
router.delete('/blogs/:id', protect, restrictTo('vendor', 'admin'), deleteVendorBlog);

// Subscription Activation (Payment-Free)
router.post('/activate-subscription', protect, restrictTo('vendor'), activateSubscription);

// ======== Shared helper: fetch vendor's fleet vehicles ========
const getVendorFleetVehicles = async (userId) => {
  const { Cab, Vendor } = require('../models/index');
  const vendorProfile = await Vendor.findOne({ user: userId });
  const vendorProfileId = vendorProfile ? vendorProfile._id : null;

  const vehicles = await Cab.find({
    $or: [
      { vendor: vendorProfileId },
      { vendorId: vendorProfileId },
      { vendorId: userId },
      { createdBy: userId }
    ],
    $and: [
      { $or: [{ isApproved: true }, { status: 'approved' }] },
      { $or: [{ isActive: true }, { isAvailable: true }] }
    ]
  });

  return vehicles.map(vehicle => {
    const vName = vehicle.vehicleName || vehicle.name || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Premium Vehicle';
    const vCategory = vehicle.category || vehicle.type || 'luxury_car';
    return {
      _id: vehicle._id,
      vehicleName: vName,
      name: vName,
      category: vCategory,
      type: vCategory,
      seatingCapacity: vehicle.seatingCapacity || 4,
      price: vehicle.price || (vehicle.pricing && vehicle.pricing.baseFare) || 0,
      isApproved: true,
      isActive: true,
      images: vehicle.images || []
    };
  });
};

router.get('/fleet', protect, restrictTo('vendor', 'admin'), async (req, res, next) => {
  try {
    const data = await getVendorFleetVehicles(req.user._id);
    res.status(200).json({ success: true, data, message: 'Vendor vehicles loaded successfully.' });
  } catch (err) { next(err); }
});

router.get('/fleet/vehicles', protect, restrictTo('vendor', 'admin'), async (req, res, next) => {
  try {
    const data = await getVendorFleetVehicles(req.user._id);
    res.status(200).json({ success: true, data, message: 'Vendor vehicles loaded successfully.' });
  } catch (err) { next(err); }
});

router.get('/fleet/my-vehicles', protect, restrictTo('vendor', 'admin'), async (req, res, next) => {
  try {
    const data = await getVendorFleetVehicles(req.user._id);
    res.status(200).json({ success: true, data, message: 'Vendor vehicles loaded successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
