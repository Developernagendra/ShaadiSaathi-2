const mongoose = require('mongoose');
const { Booking, Cab, Vendor, User, Notification } = require('../models/index');
const { sendEmail } = require('../services/emailService');
const { sendBookingNotification } = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload vehicle image
exports.uploadCabImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please provide a file', 400));

  const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
    folder: 'imperial_fleet',
    resource_type: 'auto'
  });

  res.status(200).json({
    status: 'success',
    url: result.secure_url,
    publicId: result.public_id
  });
});

// @desc    Add a new cab (Vendor/Admin)
exports.createCab = catchAsync(async (req, res, next) => {
  let vendorId = null;
  let isAdminVehicle = false;

  if (req.user.role === 'admin') {
    isAdminVehicle = true;
    if (req.body.vendor) vendorId = req.body.vendor;
  } else {
    let vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      // Auto-create stub profile to prevent crash for legacy missing profiles
      vendor = await Vendor.create({
        user: req.user._id,
        businessName: `${req.user.name || 'Vendor'}'s Business (Pending)`,
        email: req.user.email,
        phone: req.user.phone || '0000000000',
        approvalStatus: 'pending',
        profileCompletion: 0
      });
      // Link back to user document
      await User.findByIdAndUpdate(req.user._id, { vendorProfile: vendor._id });
    }
    vendorId = vendor._id;
  }

  const cab = await Cab.create({
    ...req.body,
    vendor: vendorId,
    isAdminVehicle,
    createdBy: req.user._id,
    ownerRole: req.user.role === 'admin' ? 'admin' : 'vendor',
    ownerType: req.user.role === 'admin' ? 'admin' : 'vendor',
    status: req.user.role === 'admin' ? 'approved' : (req.body.status === 'draft' ? 'draft' : 'pending'),
    isAvailable: true
  });

  res.status(201).json({ status: 'success', cab });
});


// @desc    Update a cab (Vendor/Admin)
exports.updateCab = catchAsync(async (req, res, next) => {
  let query = { _id: req.params.id };

  if (req.user.role !== 'admin') {
    let vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      vendor = await Vendor.create({
        user: req.user._id,
        businessName: `${req.user.name || 'Vendor'}'s Business (Pending)`,
        email: req.user.email,
        phone: req.user.phone || '0000000000',
        approvalStatus: 'pending',
        profileCompletion: 0
      });
      await User.findByIdAndUpdate(req.user._id, { vendorProfile: vendor._id });
    }
    query.vendor = vendor._id;

    // Security: Prevent vendors from manually approving or suspending their own vehicle
    if (req.body.status && !['draft', 'pending'].includes(req.body.status)) {
      delete req.body.status;
    }
  }

  const cab = await Cab.findOne(query);
  if (!cab) return next(new AppError('Cab not found or unauthorized', 404));

  Object.assign(cab, req.body);
  await cab.save();

  res.status(200).json({ status: 'success', cab });
});

// @desc    Delete a cab (Vendor/Admin)
exports.deleteCab = catchAsync(async (req, res, next) => {
  let query = { _id: req.params.id };

  if (req.user.role !== 'admin') {
    let vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      vendor = await Vendor.create({
        user: req.user._id,
        businessName: `${req.user.name || 'Vendor'}'s Business (Pending)`,
        email: req.user.email,
        phone: req.user.phone || '0000000000',
        approvalStatus: 'pending',
        profileCompletion: 0
      });
      await User.findByIdAndUpdate(req.user._id, { vendorProfile: vendor._id });
    }
    query.vendor = vendor._id;
  }

  const cab = await Cab.findOneAndDelete(query);
  if (!cab) return next(new AppError('Cab not found or unauthorized', 404));

  res.status(200).json({ status: 'success', message: 'Cab deleted' });
});

// @desc    Get all cabs for browsing (Public)
exports.getCabs = catchAsync(async (req, res, next) => {
  const { type, city, vendor, seating, minPrice, maxPrice, date } = req.query;

  // Base filter: Only show available, active and APPROVED vehicles
  const filter = { isAvailable: true, isActive: true, status: 'approved' };

  // 1. Vehicle Type Filter
  if (type && type.trim() !== '') {
    filter.type = type;
  }

  // 2. City Filter (Case-insensitive to handle legacy data)
  if (city && city.trim() !== '') {
    const trimmedCity = city.trim();
    filter['location.city'] = { $regex: new RegExp(`^\\s*${trimmedCity}\\s*$`, 'i') };
  }

  // 3. Ownership Filter (Admin vs Vendor)
  // Handle cases where 'null' or 'undefined' might be passed as strings from frontend
  const isVendorQuery = vendor && vendor !== 'null' && vendor !== 'undefined';

  if (isVendorQuery) {
    // If a specific vendor is requested, show that vendor's fleet PLUS the Admin (Imperial) fleet
    // This supports the 'Mix and Match' feature where users can combine vendor cars with admin cars
    filter.$or = [
      { vendor: vendor },
      { isAdminVehicle: true }
    ];
  } else {
    // If no specific vendor is requested (e.g., browsing the marketplace), show EVERYTHING 
    // available in that city (both Admin and all Vendors)
  }

  // 4. Seating Capacity Filter
  if (seating) filter.seatingCapacity = { $gte: parseInt(seating) };

  // 5. Pricing Filter
  if (minPrice || maxPrice) {
    filter['pricing.baseFare'] = {};
    if (minPrice) filter['pricing.baseFare'].$gte = parseInt(minPrice);
    if (maxPrice) filter['pricing.baseFare'].$lte = parseInt(maxPrice);
  }

  console.log('🚛 [Fleet Integration] Fetching vehicles with filter:', JSON.stringify(filter));

  const cabs = await Cab.find(filter)
    .populate('vendor', 'businessName rating images location badges verified')
    .sort({ isAdminVehicle: -1, 'rating.average': -1 })
    .lean(); // Prioritize Admin vehicles then by rating

  console.log(`✅ [Fleet Integration] Surfaced ${cabs.length} vehicles for current request.`);

  // --- Dynamic Inventory Engine ---
  let targetDate = null;
  if (date) {
    const qDate = new Date(date);
    if (!isNaN(qDate.getTime())) {
      targetDate = qDate;
    }
  }

  // Use requested date, or default to today's snapshot for base context
  const queryDate = targetDate ? new Date(targetDate) : new Date();
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  // Find overlapping bookings
  const activeBookings = await Booking.find({
    eventDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['confirmed', 'in_progress', 'on_the_way'] },
    bookingType: { $in: ['cab', 'baraat-cab'] }
  }).lean();

  const enrichedCabs = cabs.map(cab => {
    let bookedFleet = 0;
    const totalFleet = cab.totalFleet || cab.quantityAvailable || 1;

    activeBookings.forEach(b => {
      // Count fleet selection matches
      if (b.fleetSelection && b.fleetSelection.length > 0) {
        const match = b.fleetSelection.find(f => f.cabId && f.cabId.toString() === cab._id.toString());
        if (match) bookedFleet += (match.count || 1);
      } else if (b.vehicles && b.vehicles.length > 0 && b.cabIds) {
        const idx = b.cabIds.findIndex(id => id && id.toString() === cab._id.toString());
        if (idx !== -1 && b.vehicles[idx]) {
          bookedFleet += (b.vehicles[idx].count || 1);
        } else if (idx !== -1) {
          bookedFleet += 1;
        }
      } else {
        // legacy match
        if (b.cab && b.cab.toString() === cab._id.toString()) {
          bookedFleet += 1;
        }
      }
    });

    const availableFleet = Math.max(0, totalFleet - bookedFleet);
    return {
      ...cab,
      totalFleet,
      bookedFleet,
      availableFleet
    };
  });

  res.status(200).json({
    status: 'success',
    results: enrichedCabs.length,
    cabs: enrichedCabs
  });
});

// @desc    Get cab details
exports.getCabDetails = catchAsync(async (req, res, next) => {
  const cab = await Cab.findById(req.params.id)
    .populate('vendor', 'businessName rating images description phone email')
    .lean();
  if (!cab) return next(new AppError('Cab not found', 404));

  res.status(200).json({ status: 'success', cab });
});

// @desc    Get Bundle details (Public)
exports.getBundleDetails = catchAsync(async (req, res, next) => {
  // Find the Cab that contains this bundle
  const cab = await Cab.findOne({ 'bundlePackages._id': req.params.bundleId })
    .populate('vendor', 'name email businessName phone profileImage rating')
    .populate({
      path: 'bundlePackages.vehicles.vehicleId',
      model: 'Cab',
      select: 'name type brand model seatingCapacity images pricing features'
    })
    .lean();

  if (!cab) {
    return next(new AppError('Bundle not found', 404));
  }

  // Extract the specific bundle
  const bundle = cab.bundlePackages.find(b => b._id.toString() === req.params.bundleId);
  if (!bundle) {
    return next(new AppError('Bundle not found in fleet', 404));
  }

  // Ensure vendor object has businessName fallback
  const vendor = cab.vendor;
  if (vendor && !vendor.businessName) {
    vendor.businessName = vendor.name || 'Premium Vendor';
  }

  res.status(200).json({ status: 'success', bundle, parentCabId: cab._id, vendor });
});

// @desc    Get all cabs (Admin Only)
exports.getAdminFleet = catchAsync(async (req, res, next) => {
  const cabs = await Cab.find()
    .populate('vendor', 'businessName')
    .sort({ status: 1, createdAt: -1 })
    .lean(); // Pending first

  // Dynamic Inventory calculation for today
  const queryDate = new Date();
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  const activeBookings = await Booking.find({
    eventDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['confirmed', 'in_progress', 'on_the_way'] },
    bookingType: { $in: ['cab', 'baraat-cab'] }
  }).lean();

  const enrichedCabs = cabs.map(cab => {
    let bookedFleet = 0;
    const totalFleet = cab.totalFleet || cab.quantityAvailable || 1;

    activeBookings.forEach(b => {
      if (b.fleetSelection && b.fleetSelection.length > 0) {
        const match = b.fleetSelection.find(f => f.cabId && f.cabId.toString() === cab._id.toString());
        if (match) bookedFleet += (match.count || 1);
      } else if (b.vehicles && b.vehicles.length > 0 && b.cabIds) {
        const idx = b.cabIds.findIndex(id => id && id.toString() === cab._id.toString());
        if (idx !== -1 && b.vehicles[idx]) {
          bookedFleet += (b.vehicles[idx].count || 1);
        } else if (idx !== -1) {
          bookedFleet += 1;
        }
      } else {
        if (b.cab && b.cab.toString() === cab._id.toString()) {
          bookedFleet += 1;
        }
      }
    });

    return {
      ...cab,
      totalFleet,
      bookedFleet,
      availableFleet: Math.max(0, totalFleet - bookedFleet)
    };
  });

  res.status(200).json({ status: 'success', results: enrichedCabs.length, cabs: enrichedCabs });
});

// @desc    Moderate a cab (Admin Only)
exports.moderateCab = catchAsync(async (req, res, next) => {
  const { status, reason, verificationChecklist, adminRemarks, rejectionReason, internalNotes, isFeatured } = req.body;

  const allowedStatuses = ['approved', 'rejected', 'suspended', 'changes_requested', 'pending'];
  if (status && !allowedStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const cab = await Cab.findById(req.params.id);
  if (!cab) return next(new AppError('Cab not found', 404));

  const auditAction = status ? status : 'updated_remarks';
  const auditReason = (status === 'changes_requested' || status === 'rejected') ? (rejectionReason || adminRemarks) : (adminRemarks || 'Action processed via Verification Audit Room');

  if (!cab.auditLogs) cab.auditLogs = [];
  cab.auditLogs.unshift({
    adminId: req.user._id,
    adminName: req.user.name || 'System Admin',
    action: auditAction,
    reason: auditReason,
    date: new Date()
  });

  if (status) cab.status = status;
  if (verificationChecklist) cab.verificationChecklist = verificationChecklist;
  if (adminRemarks !== undefined) cab.adminRemarks = adminRemarks;
  if (rejectionReason !== undefined) cab.rejectionReason = rejectionReason;
  if (internalNotes !== undefined) cab.internalNotes = internalNotes;
  if (isFeatured !== undefined) cab.isFeatured = isFeatured;

  await cab.save();

  // Notify Vendor
  if (cab.vendor) {
    const vendorData = await Vendor.findById(cab.vendor);
    if (vendorData) {
      const statusLabel = status?.replace('_', ' ').toUpperCase() || 'UPDATED';
      let msg = `Your vehicle ${cab.name} listing status has been updated to ${statusLabel}.`;
      if (status === 'approved') {
        msg = `Your vehicle ${cab.name} has been approved and is now live!`;
      } else if (status === 'changes_requested') {
        msg = `Changes have been requested for your vehicle ${cab.name}. Reason: ${rejectionReason || adminRemarks || ''}`;
      } else if (status === 'rejected') {
        msg = `Your vehicle ${cab.name} has been rejected. Reason: ${rejectionReason || ''}`;
      }

      await Notification.create({
        recipient: vendorData.user,
        type: 'vendor_approval',
        title: `Vehicle Listing ${statusLabel}`,
        message: msg,
        link: '/vendor/manage-cabs'
      });
    }
  }

  // Socket Real-time Sync
  const io = req.app.get('io');
  if (io) {
    io.emit('fleet_updated', { cab, action: 'moderated' });
  }

  res.status(200).json({ status: 'success', cab });
});

// @desc    Get vendor's cabs
exports.getVendorCabs = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) {
    return res.status(200).json({ status: 'success', cabs: [] });
  }

  const cabs = await Cab.find({ vendor: vendor._id }).lean();

  // Dynamic Inventory calculation for today
  const queryDate = new Date();
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  const activeBookings = await Booking.find({
    vendorId: req.user._id,
    eventDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['confirmed', 'in_progress', 'on_the_way'] },
    bookingType: { $in: ['cab', 'baraat-cab'] }
  }).lean();

  const enrichedCabs = cabs.map(cab => {
    let bookedFleet = 0;
    const totalFleet = cab.totalFleet || cab.quantityAvailable || 1;

    activeBookings.forEach(b => {
      if (b.fleetSelection && b.fleetSelection.length > 0) {
        const match = b.fleetSelection.find(f => f.cabId && f.cabId.toString() === cab._id.toString());
        if (match) bookedFleet += (match.count || 1);
      } else if (b.vehicles && b.vehicles.length > 0 && b.cabIds) {
        const idx = b.cabIds.findIndex(id => id && id.toString() === cab._id.toString());
        if (idx !== -1 && b.vehicles[idx]) {
          bookedFleet += (b.vehicles[idx].count || 1);
        } else if (idx !== -1) {
          bookedFleet += 1;
        }
      } else {
        if (b.cab && b.cab.toString() === cab._id.toString()) {
          bookedFleet += 1;
        }
      }
    });

    return {
      ...cab,
      totalFleet,
      bookedFleet,
      availableFleet: Math.max(0, totalFleet - bookedFleet)
    };
  });

  res.status(200).json({ status: 'success', cabs: enrichedCabs });
});

// @desc    Get vendor cab bookings
exports.getVendorCabBookings = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10, vendorId } = req.query;

  let queryVendorId;
  if (req.user.role === 'admin' && vendorId) {
    queryVendorId = vendorId;
  } else {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(200).json({
        status: 'success',
        bookings: [],
        total: 0,
        counts: { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, in_progress: 0 }
      });
    }
    queryVendorId = vendor._id;
  }

  const query = { vendorId: req.user._id, bookingType: { $in: ['cab', 'baraat-cab'] } };
  if (status && status !== 'all') query.status = status;

  const [bookings, total, cabCounts, serviceCounts] = await Promise.all([
    Booking.find(query)
      .populate('userId', 'name email phone avatar')
      .populate('cabIds', 'name brand model vehicleNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Booking.countDocuments(query),
    Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(req.user._id), bookingType: { $in: ['cab', 'baraat-cab'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(req.user._id), bookingType: 'service' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const statusCounts = {
    all: cabCounts.reduce((acc, curr) => acc + curr.count, 0),
    pending: cabCounts.find(c => c._id === 'pending')?.count || 0,
    confirmed: cabCounts.find(c => c._id === 'confirmed')?.count || 0,
    completed: cabCounts.find(c => c._id === 'completed')?.count || 0,
    cancelled: cabCounts.reduce((acc, curr) => ['cancelled', 'rejected'].includes(curr._id) ? acc + curr.count : acc, 0),
    in_progress: cabCounts.reduce((acc, curr) => ['in_progress', 'on_the_way'].includes(curr._id) ? acc + curr.count : acc, 0),
    rejected: cabCounts.find(c => c._id === 'rejected')?.count || 0,
  };

  res.status(200).json({
    status: 'success',
    bookings,
    counts: statusCounts,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
  });
});

// @desc    Update cab booking status
// @route   PATCH /api/cab-booking/:id/status
// @access  Private (Vendor/Admin)
exports.updateCabBookingStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const booking = await Booking.findById(req.params.id).populate('userId', 'name email');

  if (!booking) return next(new AppError('Booking not found.', 404));

  // Check authorization
  if (req.user.role === 'vendor') {
    if (booking.vendorId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized.', 403));
    }
  }

  booking.status = status;
  await booking.save();

  // Trigger Multi-channel Notifications
  await sendBookingNotification({
    userId: booking.userId,
    booking: {
      ...booking.toObject(),
      serviceName: 'Baraat Cab Service'
    },
    type: 'cab',
    status: status
  });

  // Socket Real-time Sync for Vendor and Admin
  const io = req.app.get('io');
  if (io) {
    // Notify user room
    io.to(`user_${booking.userId._id}`).emit('booking_updated', { booking });
    // Notify vendor room
    io.to(`user_${booking.vendorId}`).emit('booking_updated', { booking });
    // Notify all Admins in the 'admin' room
    io.to('admin').emit('booking_updated', { booking });
  }

  res.status(200).json({
    status: 'success',
    message: 'Cab booking status updated.',
    booking
  });
});

// @desc    Get featured cabs (Public)
exports.getFeaturedCabs = catchAsync(async (req, res, next) => {
  const cabs = await Cab.find({ isFeatured: true, status: 'approved', isAvailable: true })
    .populate('vendor', 'businessName rating images location badges verified')
    .limit(10)
    .lean();
  res.status(200).json({ status: 'success', results: cabs.length, cabs });
});

module.exports = exports;
