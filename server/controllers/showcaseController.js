const { RealWedding, Gallery } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// ============================================
// REAL WEDDINGS - PUBLIC
// ============================================

exports.getApprovedRealWeddings = catchAsync(async (req, res, next) => {
  const { limit = 20, page = 1, city, vendorId } = req.query;
  const skip = (page - 1) * limit;

  const query = { status: 'approved' };
  if (city) query.city = new RegExp(city, 'i');
  if (vendorId) query.vendorId = vendorId;

  const weddings = await RealWedding.find(query)
    .populate('vendorId', 'businessName logo location')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await RealWedding.countDocuments(query);

  res.status(200).json({
    success: true,
    count: weddings.length,
    total,
    pages: Math.ceil(total / limit),
    data: weddings
  });
});

exports.getRealWeddingById = catchAsync(async (req, res, next) => {
  console.log("Wedding ID:", req.params.id);

  const wedding = await RealWedding.findById(req.params.id)
    .populate('vendorId', 'businessName logo location email phone');

  console.log("Wedding Found:", wedding ? 'Yes' : 'No');
  console.log("Wedding Status:", wedding?.status);

  if (!wedding) return next(new AppError('Real Wedding not found', 404));

  // If it's not approved, only admin or the vendor who created it can view
  if (wedding.status !== 'approved') {
    if (!req.user) return next(new AppError('Not authorized', 401));
    if (req.user.role !== 'admin' && req.user.vendorProfile?.toString() !== wedding.vendorId._id.toString()) {
      return next(new AppError('Not authorized to view this wedding', 403));
    }
  }

  res.status(200).json({ success: true, data: wedding });
});

exports.getFeaturedRealWeddings = catchAsync(async (req, res, next) => {
  const weddings = await RealWedding.find({ status: 'approved', featured: true })
    .populate('vendorId', 'businessName logo location')
    .sort('-createdAt')
    .limit(6);

  res.status(200).json({ success: true, data: weddings });
});

// ============================================
// REAL WEDDINGS - VENDOR
// ============================================

exports.getVendorRealWeddings = catchAsync(async (req, res, next) => {
  if (!req.user.vendorProfile) return next(new AppError('Not a vendor', 403));

  const weddings = await RealWedding.find({ vendorId: req.user.vendorProfile })
    .sort('-createdAt');

  res.status(200).json({ success: true, count: weddings.length, data: weddings });
});

exports.createRealWedding = catchAsync(async (req, res, next) => {
  if (!req.user.vendorProfile) return next(new AppError('Not a vendor', 403));
  console.log('Real Wedding Create - Files received:', req.files);
  console.log('Real Wedding Create - Body received:', req.body);

  const payload = { ...req.body };
  if (req.files) {
    if (req.files.coverImage && req.files.coverImage.length > 0) {
      payload.coverImage = req.files.coverImage[0].path;
    }
    if (req.files.galleryImages) {
      payload.galleryImages = req.files.galleryImages.map(f => f.path);
    }
  }

  const newWedding = await RealWedding.create({
    ...payload,
    vendorId: req.user.vendorProfile,
    status: req.body.status === 'draft' ? 'draft' : 'pending',
    featured: false // Vendors cannot feature their own posts
  });

  res.status(201).json({ success: true, data: newWedding });
});

exports.updateRealWedding = catchAsync(async (req, res, next) => {
  const wedding = await RealWedding.findOne({ _id: req.params.id, vendorId: req.user.vendorProfile });
  
  if (!wedding) return next(new AppError('Real Wedding not found or unauthorized', 404));

  // If status is being changed to pending, allow it. If it was approved, changing it requires re-approval
  let status = wedding.status;
  if (req.body.status === 'pending') status = 'pending';
  else if (req.body.status === 'draft') status = 'draft';

  console.log('Real Wedding Update - Files received:', req.files);

  const payload = { ...req.body };
  if (req.files) {
    if (req.files.coverImage && req.files.coverImage.length > 0) {
      payload.coverImage = req.files.coverImage[0].path;
    }
    if (req.files.galleryImages) {
      payload.galleryImages = payload.galleryImages || [];
      const newImages = req.files.galleryImages.map(f => f.path);
      // Wait, how do we merge existing images? We'll assume the frontend passes existing URLs as strings in `galleryImages` array and new files in `req.files`.
      // The frontend should pass existing URLs in a `existingGalleryImages` field or similar.
      // For now, if req.files.galleryImages exists, we append them.
      if (Array.isArray(req.body.galleryImages)) {
        payload.galleryImages = [...req.body.galleryImages, ...newImages];
      } else if (typeof req.body.galleryImages === 'string') {
        payload.galleryImages = [req.body.galleryImages, ...newImages];
      } else {
        payload.galleryImages = newImages;
      }
    }
  }

  const updatedWedding = await RealWedding.findByIdAndUpdate(
    req.params.id,
    { ...payload, status, featured: wedding.featured }, // Protect featured
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: updatedWedding });
});

exports.deleteRealWedding = catchAsync(async (req, res, next) => {
  const wedding = await RealWedding.findOneAndDelete({ _id: req.params.id, vendorId: req.user.vendorProfile });
  if (!wedding) return next(new AppError('Real Wedding not found or unauthorized', 404));
  res.status(200).json({ success: true, data: null });
});

// ============================================
// REAL WEDDINGS - ADMIN
// ============================================

exports.getAllRealWeddingsAdmin = catchAsync(async (req, res, next) => {
  const weddings = await RealWedding.find()
    .populate('vendorId', 'businessName email')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: weddings.length, data: weddings });
});

exports.updateRealWeddingAdmin = catchAsync(async (req, res, next) => {
  const updatedWedding = await RealWedding.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedWedding) return next(new AppError('Real Wedding not found', 404));
  res.status(200).json({ success: true, data: updatedWedding });
});

exports.deleteRealWeddingAdmin = catchAsync(async (req, res, next) => {
  const wedding = await RealWedding.findByIdAndDelete(req.params.id);
  if (!wedding) return next(new AppError('Real Wedding not found', 404));
  res.status(200).json({ success: true, data: null });
});


// ============================================
// GALLERY - PUBLIC
// ============================================

exports.getApprovedGallery = catchAsync(async (req, res, next) => {
  const { category, limit = 50, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const query = { status: 'approved' };
  if (category) query.category = category;

  const galleryItems = await Gallery.find(query)
    .populate('vendorId', 'businessName logo location')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Gallery.countDocuments(query);

  res.status(200).json({
    success: true,
    count: galleryItems.length,
    total,
    pages: Math.ceil(total / limit),
    data: galleryItems
  });
});

exports.getFeaturedGallery = catchAsync(async (req, res, next) => {
  const galleryItems = await Gallery.find({ status: 'approved', featured: true })
    .populate('vendorId', 'businessName logo')
    .sort('-createdAt')
    .limit(12);
  res.status(200).json({ success: true, data: galleryItems });
});


// ============================================
// GALLERY - VENDOR
// ============================================

exports.getVendorGallery = catchAsync(async (req, res, next) => {
  if (!req.user.vendorProfile) return next(new AppError('Not a vendor', 403));
  const galleryItems = await Gallery.find({ vendorId: req.user.vendorProfile }).sort('-createdAt');
  res.status(200).json({ success: true, count: galleryItems.length, data: galleryItems });
});

exports.createGalleryItem = catchAsync(async (req, res, next) => {
  if (!req.user.vendorProfile) return next(new AppError('Not a vendor', 403));
  console.log('Gallery Create - Files received:', req.files);
  console.log('Gallery Create - Body received:', req.body);

  const payload = { ...req.body };
  if (req.files) {
    if (req.files.images) {
      payload.images = req.files.images.map(f => f.path);
    }
    if (req.files.videos) {
      payload.videos = req.files.videos.map(f => f.path);
    }
  }

  const newItem = await Gallery.create({
    ...payload,
    vendorId: req.user.vendorProfile,
    status: req.body.status === 'draft' ? 'draft' : 'pending',
    featured: false
  });

  res.status(201).json({ success: true, data: newItem });
});

exports.updateGalleryItem = catchAsync(async (req, res, next) => {
  const item = await Gallery.findOne({ _id: req.params.id, vendorId: req.user.vendorProfile });
  if (!item) return next(new AppError('Gallery item not found or unauthorized', 404));

  let status = item.status;
  if (req.body.status === 'pending') status = 'pending';
  else if (req.body.status === 'draft') status = 'draft';

  console.log('Gallery Update - Files received:', req.files);
  const payload = { ...req.body };
  if (req.files) {
    if (req.files.images) {
      const newImages = req.files.images.map(f => f.path);
      if (Array.isArray(req.body.images)) {
        payload.images = [...req.body.images, ...newImages];
      } else if (typeof req.body.images === 'string') {
        payload.images = [req.body.images, ...newImages];
      } else {
        payload.images = newImages;
      }
    }
    if (req.files.videos) {
      const newVideos = req.files.videos.map(f => f.path);
      if (Array.isArray(req.body.videos)) {
        payload.videos = [...req.body.videos, ...newVideos];
      } else if (typeof req.body.videos === 'string') {
        payload.videos = [req.body.videos, ...newVideos];
      } else {
        payload.videos = newVideos;
      }
    }
  }

  const updatedItem = await Gallery.findByIdAndUpdate(
    req.params.id,
    { ...payload, status, featured: item.featured },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: updatedItem });
});

exports.deleteGalleryItem = catchAsync(async (req, res, next) => {
  const item = await Gallery.findOneAndDelete({ _id: req.params.id, vendorId: req.user.vendorProfile });
  if (!item) return next(new AppError('Gallery item not found or unauthorized', 404));
  res.status(200).json({ success: true, data: null });
});

// ============================================
// GALLERY - ADMIN
// ============================================

exports.getAllGalleryAdmin = catchAsync(async (req, res, next) => {
  const galleryItems = await Gallery.find()
    .populate('vendorId', 'businessName email')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: galleryItems.length, data: galleryItems });
});

exports.updateGalleryAdmin = catchAsync(async (req, res, next) => {
  const updatedItem = await Gallery.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedItem) return next(new AppError('Gallery item not found', 404));
  res.status(200).json({ success: true, data: updatedItem });
});

exports.deleteGalleryAdmin = catchAsync(async (req, res, next) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) return next(new AppError('Gallery item not found', 404));
  res.status(200).json({ success: true, data: null });
});
