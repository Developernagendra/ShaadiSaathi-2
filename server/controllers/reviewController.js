const { Review, Booking, Cab, Vendor } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Helper to update average rating
const updateAverageRating = async (modelName, id) => {
  const allReviews = await Review.find({ [modelName.toLowerCase()]: id, status: 'approved' });
  const avgRating = allReviews.length > 0 ? 
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;

  const targetModel = modelName === 'Vendor' ? Vendor : Cab;
  const target = await targetModel.findById(id);
  
  if (target) {
    target.rating = { 
      average: Math.round(avgRating * 10) / 10, 
      count: allReviews.length 
    };
    await target.save({ validateBeforeSave: false });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = catchAsync(async (req, res, next) => {
  const { vendorId, cabId, bookingId, rating, title, comment, categories } = req.body;

  if (!vendorId && !cabId) {
    return next(new AppError('Must provide either vendorId or cabId', 400));
  }

  const queryParams = { user: req.user._id };
  if (vendorId) queryParams.vendor = vendorId;
  if (cabId) queryParams.cab = cabId;

  // Prevent duplicate reviews for the same target unless they have multiple bookings?
  // Let's restrict one review per target for now to prevent spam, or restrict by bookingId.
  if (bookingId) {
    const existingReview = await Review.findOne({ user: req.user._id, booking: bookingId });
    if (existingReview) {
      return next(new AppError('You have already reviewed this booking.', 400));
    }
  } else {
    const existingReview = await Review.findOne(queryParams);
    if (existingReview) {
      return next(new AppError('You have already reviewed this entity.', 400));
    }
  }

  let booking;
  if (bookingId) {
    booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
  } else {
    // Auto-detect a completed booking if not provided
    if (vendorId) {
      booking = await Booking.findOne({ userId: req.user._id, vendorProfileId: vendorId, status: { $in: ['confirmed', 'completed'] } });
    } else if (cabId) {
      booking = await Booking.findOne({ userId: req.user._id, cabIds: cabId, status: { $in: ['confirmed', 'completed'] } });
    }
  }

  if (!booking) {
    return next(new AppError('You can only review vendors/cabs you have successfully booked and completed.', 403));
  }

  if (['pending', 'cancelled'].includes(booking.status)) {
    return next(new AppError('You can only review completed or confirmed bookings.', 400));
  }

  const finalBookingId = booking._id;

  const review = await Review.create({
    user: req.user._id,
    vendor: vendorId || undefined,
    cab: cabId || undefined,
    booking: finalBookingId || undefined,
    bookingModel: 'Booking',
    rating,
    title,
    comment,
    categories,
    isVerifiedPurchase: !!finalBookingId,
  });

  // Update average rating
  if (vendorId) await updateAverageRating('Vendor', vendorId);
  if (cabId) await updateAverageRating('Cab', cabId);

  // Mark booking as reviewed
  if (finalBookingId) {
    await Booking.findByIdAndUpdate(finalBookingId, { isReviewed: true });
  }

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');
  res.status(201).json({
    status: 'success',
    message: 'Review submitted successfully.',
    review: populatedReview
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = catchAsync(async (req, res, next) => {
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });

  if (!review) return next(new AppError('Review not found or not authorized.', 404));

  review.rating = rating || review.rating;
  review.title = title !== undefined ? title : review.title;
  review.comment = comment || review.comment;
  
  await review.save();

  if (review.vendor) await updateAverageRating('Vendor', review.vendor);
  if (review.cab) await updateAverageRating('Cab', review.cab);

  const updatedReview = await Review.findById(review._id).populate('user', 'name avatar');
  
  res.status(200).json({
    status: 'success',
    review: updatedReview
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  // Admin or review author
  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this review.', 403));
  }

  const vendorId = review.vendor;
  const cabId = review.cab;
  const bookingId = review.booking;
  const bookingModelType = review.bookingModel;

  await review.deleteOne();

  if (vendorId) await updateAverageRating('Vendor', vendorId);
  if (cabId) await updateAverageRating('Cab', cabId);

  if (bookingId) {
    await Booking.findByIdAndUpdate(bookingId, { isReviewed: false });
  }

  res.status(204).json({ status: 'success', data: null });
});

// @desc    Get vendor reviews
// @route   GET /api/reviews/vendor/:vendorId
// @access  Public
exports.getVendorReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { vendor: req.params.vendorId };
  if (req.user) {
    query.$or = [{ status: 'approved' }, { user: req.user._id }];
  } else {
    query.status = 'approved';
  }

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    reviews,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
  });
});

// @desc    Get cab reviews
// @route   GET /api/reviews/cab/:cabId
// @access  Public
exports.getCabReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { cab: req.params.cabId };
  if (req.user) {
    query.$or = [{ status: 'approved' }, { user: req.user._id }];
  } else {
    query.status = 'approved';
  }

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    reviews,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
  });
});

// @desc    Reply to review (vendor)
// @route   PATCH /api/reviews/:id/reply
// @access  Private (vendor)
exports.replyToReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor || review.vendor?.toString() !== vendor._id.toString()) {
    return next(new AppError('Not authorized.', 403));
  }

  review.vendorReply = { comment: req.body.comment, repliedAt: Date.now() };
  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Reply added.',
    review
  });
});

// @desc    Get reviews for vendor dashboard
// @route   GET /api/reviews/dashboard
// @access  Private (vendor)
exports.getVendorDashboardReviews = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return next(new AppError('Vendor not found', 404));

  const { page = 1, limit = 20 } = req.query;
  const total = await Review.countDocuments({ vendor: vendor._id });
  const reviews = await Review.find({ vendor: vendor._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    reviews,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
  });
});

// @desc    Update review status
// @route   PATCH /api/reviews/:id/status
// @access  Private (vendor/admin)
exports.updateReviewStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  if (req.user.role !== 'admin') {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || review.vendor?.toString() !== vendor._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }
  }

  review.status = status;
  await review.save();

  // Recalculate rating because approval status changed
  if (review.vendor) await updateAverageRating('Vendor', review.vendor);
  if (review.cab) await updateAverageRating('Cab', review.cab);

  res.status(200).json({
    status: 'success',
    message: `Review ${status}`,
    review
  });
});
