const { Offer } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const cloudinary = require('../config/cloudinary');

// Helpers for automatic status resolution
const resolveOfferStatus = (offer) => {
  const now = new Date();
  if (offer.status !== 'paused' && offer.status !== 'draft') {
    if (offer.endDate < now) return 'expired';
    if (offer.startDate > now) return 'upcoming';
    return 'active';
  }
  return offer.status;
};

// 1. Get vendor offers (with summary analytics)
exports.getVendorOffers = catchAsync(async (req, res, next) => {
  const vendorId = req.user._id;
  
  let offers = await Offer.find({ vendorId }).sort('-createdAt');
  
  // Calculate dynamic statuses
  let updated = false;
  offers = offers.map(offer => {
    const newStatus = resolveOfferStatus(offer);
    if (newStatus !== offer.status) {
      offer.status = newStatus;
      offer.save(); // Async background save
      updated = true;
    }
    return offer;
  });

  // Calculate top level summaries
  const stats = {
    total: offers.length,
    active: offers.filter(o => o.status === 'active').length,
    expired: offers.filter(o => o.status === 'expired').length,
    upcoming: offers.filter(o => o.status === 'upcoming').length,
    totalRevenue: offers.reduce((acc, curr) => acc + (curr.analytics.revenueGenerated || 0), 0),
    totalConversions: offers.reduce((acc, curr) => acc + (curr.analytics.conversions || 0), 0),
  };

  res.status(200).json({
    status: 'success',
    stats,
    data: {
      offers
    }
  });
});

// 2. Create offer
exports.createOffer = catchAsync(async (req, res, next) => {
  req.body.vendorId = req.user._id;
  
  const now = new Date();
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  if (endDate <= startDate) {
    return next(new AppError('End date must be after start date', 400));
  }

  const newOffer = await Offer.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      offer: newOffer
    }
  });
});

// 3. Update offer (including pause/resume)
exports.updateOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findOne({ _id: req.params.id, vendorId: req.user._id });

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  // Handle explicit status overrides vs data updates
  Object.keys(req.body).forEach(key => {
    offer[key] = req.body[key];
  });

  // Re-resolve status if dates changed, unless explicitly setting to paused
  if (req.body.status !== 'paused' && req.body.status !== 'draft') {
    offer.status = resolveOfferStatus(offer);
  }

  await offer.save();

  res.status(200).json({
    status: 'success',
    data: {
      offer
    }
  });
});

// 4. Delete offer
exports.deleteOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findOneAndDelete({ _id: req.params.id, vendorId: req.user._id });

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  // If there's an image on Cloudinary, delete it in the background
  if (offer.bannerImage && offer.bannerImage.publicId) {
    cloudinary.uploader.destroy(offer.bannerImage.publicId).catch(err => console.log('Cloudinary err:', err));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// 5. Duplicate offer
exports.duplicateOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findOne({ _id: req.params.id, vendorId: req.user._id });

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  const offerObj = offer.toObject();
  delete offerObj._id;
  delete offerObj.createdAt;
  delete offerObj.updatedAt;
  offerObj.title = `${offerObj.title} (Copy)`;
  offerObj.status = 'draft'; // Ensure copies start as draft
  offerObj.usageCount = 0;
  offerObj.analytics = { views: 0, clicks: 0, conversions: 0, bookingsGenerated: 0, revenueGenerated: 0 };

  const newOffer = await Offer.create(offerObj);

  res.status(201).json({
    status: 'success',
    data: {
      offer: newOffer
    }
  });
});

// 6. Get public active offers (For customers browsing services)
exports.getActiveOffers = catchAsync(async (req, res, next) => {
  const query = { status: 'active' };
  
  // Optionally filter by vendor or service
  if (req.query.vendorId) query.vendorId = req.query.vendorId;
  if (req.query.serviceId) query.serviceId = req.query.serviceId;

  const offers = await Offer.find(query);

  res.status(200).json({
    status: 'success',
    results: offers.length,
    data: { offers }
  });
});
