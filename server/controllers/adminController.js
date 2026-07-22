const { Booking, User, Vendor } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = catchAsync(async (req, res, next) => {
  const [
    totalUsers, totalVendors, pendingVendors, totalBookings,
    completedBookings, recentUsers,
    recentVendors, totalCabs,
    pendingBookingsCount, approvedBookingsCount, cancelledBookingsCount,
    pendingServices
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Vendor.countDocuments({ approvalStatus: 'approved' }),
    Vendor.countDocuments({ approvalStatus: 'pending' }),
    Booking.countDocuments(), // Unified
    Booking.countDocuments({ status: 'completed' }), // Unified
    User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt').lean(),
    Vendor.find({ approvalStatus: 'pending' }).select('businessName category user createdAt approvalStatus').populate('user', 'name email').populate('category', 'name').sort({ createdAt: -1 }).limit(5).lean(),
    require('../models/index').Cab.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: { $in: ['cancelled', 'rejected'] } }),
    require('../models/index').Service.countDocuments({ status: 'pending' })
  ]);

  // Compute Revenue Analytics based on exact paymentStatus and prices
  const revData = await Booking.aggregate([
    {
      $facet: {
        totalRevenue: [
          { $match: { paymentStatus: { $in: ['partial_paid', 'paid', 'advance_paid', 'fully_paid'] } } },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $cond: [
                    { $in: ['$paymentStatus', ['paid', 'fully_paid']] },
                    '$totalPrice',
                    '$advanceAmount'
                  ]
                }
              }
            }
          }
        ],
        pendingPayments: [
          { $match: { paymentStatus: { $in: ['pending', 'failed', 'unpaid'] } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$advanceAmount' }
            }
          }
        ],
        partialPayments: [
          { $match: { paymentStatus: { $in: ['partial_paid', 'advance_paid'] } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$advanceAmount' }
            }
          }
        ],
        completedPayments: [
          { $match: { paymentStatus: { $in: ['paid', 'fully_paid'] } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$totalPrice' }
            }
          }
        ]
      }
    }
  ]);

  const totalRevenueVal = revData[0]?.totalRevenue[0]?.total || 0;
  const pendingPaymentsCount = revData[0]?.pendingPayments[0]?.count || 0;
  const pendingPaymentsSum = revData[0]?.pendingPayments[0]?.amount || 0;
  const partialPaymentsCount = revData[0]?.partialPayments[0]?.count || 0;
  const partialPaymentsSum = revData[0]?.partialPayments[0]?.amount || 0;
  const completedPaymentsCount = revData[0]?.completedPayments[0]?.count || 0;
  const completedPaymentsSum = revData[0]?.completedPayments[0]?.amount || 0;

  const [monthlyBookings] = await Promise.all([
    Booking.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ])
  ]);

  const finalMonthly = monthlyBookings;

  const categoryStats = await Vendor.aggregate([
    { $match: { approvalStatus: 'approved' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        revenue: { $sum: '$totalEarnings' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ['$categoryInfo.name', 'Uncategorized / Pending'] },
        icon: { $ifNull: ['$categoryInfo.icon', 'default-icon'] },
        count: 1,
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  const CabModel = require('../models/index').Cab;
  const allCabs = await CabModel.find().lean();
  const totalVehiclesCount = allCabs.reduce((acc, curr) => acc + (curr.totalFleet || curr.quantityAvailable || 1), 0);

  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
  const activeBookingsToday = await Booking.find({
    eventDate: { $gte: startOfToday, $lte: endOfToday },
    status: { $in: ['confirmed', 'in_progress', 'on_the_way'] },
    bookingType: { $in: ['cab', 'baraat-cab'] }
  }).lean();

  let bookedVehiclesCount = 0;
  activeBookingsToday.forEach(b => {
    if (b.fleetSelection && b.fleetSelection.length > 0) {
      b.fleetSelection.forEach(item => {
        bookedVehiclesCount += (item.count || 1);
      });
    } else if (b.vehicles && b.vehicles.length > 0 && b.cabIds) {
      b.cabIds.forEach((id, idx) => {
        bookedVehiclesCount += (b.vehicles[idx]?.count || 1);
      });
    } else {
      if (b.cab) {
        bookedVehiclesCount += 1;
      }
    }
  });

  const availableVehiclesCount = Math.max(0, totalVehiclesCount - bookedVehiclesCount);

  let soldOutVehiclesCount = 0;
  allCabs.forEach(cab => {
    let cabBooked = 0;
    const cabTotal = cab.totalFleet || cab.quantityAvailable || 1;
    activeBookingsToday.forEach(b => {
      if (b.fleetSelection && b.fleetSelection.length > 0) {
        const match = b.fleetSelection.find(f => f.cabId && f.cabId.toString() === cab._id.toString());
        if (match) cabBooked += (match.count || 1);
      } else if (b.vehicles && b.vehicles.length > 0 && b.cabIds) {
        const idx = b.cabIds.findIndex(id => id && id.toString() === cab._id.toString());
        if (idx !== -1 && b.vehicles[idx]) {
          cabBooked += (b.vehicles[idx].count || 1);
        } else if (idx !== -1) {
          cabBooked += 1;
        }
      } else {
        if (b.cab && b.cab.toString() === cab._id.toString()) {
          cabBooked += 1;
        }
      }
    });
    const cabAvailable = Math.max(0, cabTotal - cabBooked);
    if (cabAvailable === 0) {
      soldOutVehiclesCount += 1;
    }
  });

  const recentTransactions = await Booking.find()
    .populate('userId', 'name email')
    .populate('vendorProfileId', 'businessName')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalUsers,
        totalVendors,
        pendingVendors,
        pendingServices,
        totalBookings,
        completedBookings,
        totalRevenue: totalRevenueVal,
        pendingPayments: pendingPaymentsCount,
        pendingPaymentsSum,
        partialPayments: partialPaymentsCount,
        partialPaymentsSum,
        completedPayments: completedPaymentsCount,
        completedPaymentsSum,
        totalCabs: totalCabs || 0,
        totalVehicles: totalVehiclesCount,
        bookedVehicles: bookedVehiclesCount,
        availableVehicles: availableVehiclesCount,
        soldOutVehicles: soldOutVehiclesCount,
        pendingBookings: pendingBookingsCount,
        approvedBookings: approvedBookingsCount,
        cancelledBookings: cancelledBookingsCount
      },
      recentUsers,
      recentVendors,
      monthlyBookings: finalMonthly,
      categoryStats,
      recentTransactions
    }
  });
});

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookingsAdmin = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, type = 'services', search } = req.query;
  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (type === 'cabs') {
    query.bookingType = { $in: ['cab', 'baraat-cab'] };
  } else if (type === 'services') {
    query.bookingType = 'service';
  }

  if (search) {
    query.$or = [
      { bookingId: { $regex: search, $options: 'i' } },
      { contactName: { $regex: search, $options: 'i' } },
      { serviceName: { $regex: search, $options: 'i' } }
    ];
  }

  const countQuery = { ...query };
  delete countQuery.status;

  const [bookings, total, counts] = await Promise.all([
    Booking.find(query)
      .select('bookingId userId contactName contactPhone contactEmail vendorProfileId bookingType serviceName serviceCategory eventDate eventCity guestCount amount totalPrice status createdAt pickupLocation vehicles')
      .populate('userId', 'name email phone avatar')
      .populate('vendorProfileId', 'businessName location phone')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Booking.countDocuments(query),
    Booking.aggregate([
      { $match: countQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const statusCounts = {
    all: counts.reduce((acc, curr) => acc + curr.count, 0),
    pending: counts.find(c => c._id === 'pending')?.count || 0,
    confirmed: counts.find(c => c._id === 'confirmed')?.count || 0,
    completed: counts.find(c => c._id === 'completed')?.count || 0,
    cancelled: counts.find(c => c._id === 'cancelled')?.count || 0,
    rejected: counts.find(c => c._id === 'rejected')?.count || 0,
    in_progress: counts.find(c => c._id === 'in_progress')?.count || 0,
  };

  const mappedBookings = bookings.map(b => {
    const bObj = b;
    if (!bObj.user && bObj.userId) {
      bObj.user = bObj.userId;
    }
    if (!bObj.vendor) {
      bObj.vendor = bObj.vendorProfileId || bObj.vendorId;
    }
    return bObj;
  });

  res.status(200).json({
    status: 'success',
    bookings: mappedBookings,
    counts: statusCounts,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
  });
});

// @desc    Get booking details by ID (Admin)
// @route   GET /api/admin/bookings/:id
// @access  Private (Admin)
exports.getBookingByIdAdmin = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('userId', 'name email phone avatar')
    .populate('user', 'name email phone avatar')
    .populate('vendorId', 'name email phone')
    .populate('vendor', 'name email phone')
    .populate('vendorProfileId', 'businessName location phone email coverImage')
    .populate('service')
    .populate('cab');

  if (!booking) {
    return next(new AppError('Booking not found.', 404));
  }

  const bObj = booking.toObject ? booking.toObject() : booking;
  if (!bObj.user && bObj.userId) {
    bObj.user = bObj.userId;
  }
  if (!bObj.vendor) {
    bObj.vendor = bObj.vendorProfileId || bObj.vendorId;
  }

  res.status(200).json({
    status: 'success',
    booking: bObj
  });
});

// @desc    Update vendor status (Approve/Reject)
// @route   PATCH /api/admin/vendors/:id/status
// @access  Private (Admin)
exports.updateVendorStatus = catchAsync(async (req, res, next) => {
  const { approvalStatus, approvalNote, badges, isFeatured, verificationDocuments } = req.body;

  if (approvalStatus && !['approved', 'rejected', 'suspended', 'pending'].includes(approvalStatus)) {
    return next(new AppError('Invalid approval status.', 400));
  }

  const updateData = {};
  if (approvalStatus) updateData.approvalStatus = approvalStatus;
  if (approvalNote !== undefined) updateData.approvalNote = approvalNote;
  if (badges !== undefined) updateData.badges = badges;
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
  if (verificationDocuments !== undefined) updateData.verificationDocuments = verificationDocuments;

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'email name');

  if (!vendor) return next(new AppError('Vendor not found', 404));

  // Update user role if approved
  if (approvalStatus === 'approved' && vendor.user && vendor.user._id) {
    await User.findByIdAndUpdate(vendor.user._id, { role: 'vendor' });
  }

  // Send email notification (Fail-safe)
  try {
    const { sendEmail, emailTemplates } = require('../services/emailService');
    if (emailTemplates && emailTemplates.vendorApproval) {
      const template = emailTemplates.vendorApproval(vendor.user.name, approvalStatus || vendor.approvalStatus);
      await sendEmail({ to: vendor.user.email, ...template });
    }
  } catch (err) {
    console.error('Email notification failed during vendor approval:', err);
  }

  // Trigger Real-time Notification if approvalStatus is updated
  if (approvalStatus) {
    try {
      const { sendNotification } = require('../services/notificationService');
      await sendNotification({
        recipient: vendor.user._id,
        sender: req.user._id,
        type: 'vendor_approval',
        title: approvalStatus === 'approved' ? 'Partner Account Approved! 🎉' : 'Vendor Status Update',
        message: approvalStatus === 'approved'
          ? 'Congratulations! Your vendor profile has been approved. You can now start adding services and receiving bookings.'
          : `Your vendor account status has been updated to ${approvalStatus}. ${approvalNote ? 'Reason: ' + approvalNote : ''}`,
        link: '/vendor/dashboard',
        data: { vendorId: vendor._id }
      });
    } catch (err) {
      console.error('Vendor status update notification failed:', err);
    }
  }

  // Socket Realtime Sync
  const io = req.app.get('io');
  if (io) {
    io.emit('vendor_updated', { vendorId: vendor._id, status: approvalStatus });
    io.emit('featured_vendors_updated');
    io.emit('auth-event', {
      type: 'ADMIN_ACTION',
      role: 'admin',
      message: `Vendor profile ${approvalStatus}`
    });
  }

  res.status(200).json({ status: 'success', data: { vendor } });
});

// @desc    Get all vendors with filters
// @route   GET /api/admin/vendors
// @access  Private (Admin)
exports.getAllVendorsAdmin = catchAsync(async (req, res, next) => {
  const { approvalStatus } = req.query;
  const query = approvalStatus ? { approvalStatus } : {};
  const vendors = await Vendor.find(query)
    .select('businessName category user location phone email images approvalStatus isFeatured verificationDocuments createdAt')
    .populate('user', 'name email phone')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .lean(); // Use lean for performance and easier formatting

  const safeVendors = vendors.map(v => ({
    ...v,
    user: v.user || { name: 'Unknown User', email: 'N/A', phone: 'N/A' },
    category: v.category || { name: 'Uncategorized' },
    businessName: v.businessName || 'Pending Business Name'
  }));

  res.status(200).json({ status: 'success', results: safeVendors.length, vendors: safeVendors });
});

// @desc    Get all leads
// @route   GET /api/admin/leads
// @access  Private (Admin)
exports.getAllLeadsAdmin = catchAsync(async (req, res, next) => {
  const { Lead } = require('../models/FeatureModels');
  const VendorLead = require('../models/VendorLead');

  const [marketplaceLeads, vendorLeads] = await Promise.all([
    Lead.find()
      .populate('user', 'name email phone')
      .populate('serviceType', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    VendorLead.find()
      .populate('user', 'name email phone')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .lean()
  ]);

  // Format vendorLeads to match the structure expected by the frontend if needed, 
  // or just pass them and let frontend handle it.
  const formattedVendorLeads = vendorLeads.map(l => ({
    _id: l._id,
    user: l.user,
    city: l.city,
    serviceType: { name: l.serviceRequired || 'Direct Enquiry' },
    eventDate: l.weddingDate,
    budget: l.budget,
    description: `Direct WhatsApp enquiry to ${l.vendor?.businessName || 'Vendor'}`,
    status: l.status === 'won' ? 'closed' : 'open',
    createdAt: l.createdAt,
    quotations: [{ vendor: l.vendor }], // Mock a quote so it displays the vendor image
    leadType: 'whatsapp'
  }));

  const leads = [...marketplaceLeads, ...formattedVendorLeads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({ status: 'success', leads });
});

// @desc    Get all blogs
// @route   GET /api/admin/blogs
// @access  Private (Admin)
exports.getAllBlogsAdmin = catchAsync(async (req, res, next) => {
  const { Blog } = require('../models/FeatureModels');
  const blogs = await Blog.find()
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ status: 'success', blogs });
});

// @desc    Create/Update blog
// @route   POST /api/admin/blogs
// @access  Private (Admin)
exports.saveBlog = catchAsync(async (req, res, next) => {
  const { Blog } = require('../models/FeatureModels');
  const { id, title, content, excerpt, coverImage, category, tags, isPublished } = req.body;

  if (!title || !content) {
    return next(new AppError('Title and Content are required.', 400));
  }

  let blog;
  if (id) {
    blog = await Blog.findById(id);
    if (!blog) return next(new AppError('Blog not found', 404));

    blog.title = title;
    blog.content = content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.coverImage = coverImage || blog.coverImage;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;
    blog.isPublished = isPublished !== undefined ? isPublished : blog.isPublished;

    await blog.save();
  } else {
    blog = await Blog.create({
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      isPublished,
      author: req.user._id
    });
  }

  // Populate author before returning
  blog = await Blog.findById(blog._id).populate('author', 'name email avatar');

  res.status(200).json({ status: 'success', blog });
});

// @desc    Delete blog
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin)
exports.deleteBlog = catchAsync(async (req, res, next) => {
  const { Blog } = require('../models/FeatureModels');
  await Blog.findByIdAndDelete(req.params.id);
  res.status(200).json({ status: 'success', message: 'Blog deleted' });
});

// @desc    Upload file directly (Cloudinary)
// @route   POST /api/admin/upload
// @access  Private (Admin)
exports.uploadAdminFile = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('No file uploaded.', 400));

  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    // Leverage top-level destructured cloudinary import and apply automatic compression transformations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'admin_uploads',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' } // Direct Cloudinary compression & delivery optimization
      ]
    });

    console.log('✅ Blog image uploaded to Cloudinary successfully:', result.secure_url);
    res.status(200).json({ status: 'success', url: result.secure_url });
  } catch (error) {
    console.error('❌ Cloudinary integration error:', error);
    return next(new AppError(`Cloudinary integration failure: ${error.message || 'Failed to connect to media CDN.'}`, 500));
  }
});

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private (Admin)
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const { Review } = require('../models/index');

  const total = await Review.countDocuments();
  const reviews = await Review.find()
    .populate('user', 'name email avatar')
    .populate('vendor', 'businessName')
    .populate('cab', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    reviews,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
  });
});

// @desc    Get all services with optional status filtering (Admin)
// @route   GET /api/admin/services
// @access  Private (Admin)
exports.getAllServicesAdmin = catchAsync(async (req, res, next) => {
  const { Service } = require('../models/index');
  const { status } = req.query;

  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const services = await Service.find(query)
    .select('title coverImage images vendor category startingPrice price packages status createdAt city duration')
    .populate('vendor', 'businessName email phone')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // Dynamic counts for each status
  const [totalAll, totalPending, totalApproved, totalRejected] = await Promise.all([
    Service.countDocuments({}),
    Service.countDocuments({ status: 'pending' }),
    Service.countDocuments({ status: 'approved' }),
    Service.countDocuments({ status: 'rejected' })
  ]);

  res.status(200).json({
    status: 'success',
    counts: {
      all: totalAll,
      pending: totalPending,
      approved: totalApproved,
      rejected: totalRejected
    },
    services
  });
});

// @desc    Get pending services (Admin)
// @route   GET /api/admin/services/pending
// @access  Private (Admin)
exports.getPendingServicesAdmin = catchAsync(async (req, res, next) => {
  const { Service } = require('../models/index');
  const services = await Service.find({ status: 'pending' })
    .select('title coverImage images vendor category startingPrice price packages status createdAt city duration')
    .populate('vendor', 'businessName')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .lean();

  console.log('PENDING SERVICES FETCHED');

  res.status(200).json({
    status: 'success',
    services
  });
});

// @desc    Approve or reject a service (Admin)
// @route   PATCH /api/admin/services/:id/status
// @access  Private (Admin)
exports.updateServiceStatusAdmin = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status value.', 400));
  }

  const { Service } = require('../models/index');
  const service = await Service.findById(req.params.id)
    .populate({
      path: 'vendor',
      populate: { path: 'user' }
    });

  if (!service) return next(new AppError('Service not found.', 404));

  service.status = status;
  if (status === 'approved') {
    service.isActive = true;
    service.approvedBy = req.user._id;
    service.approvedAt = Date.now();
  } else if (status === 'rejected') {
    service.isActive = false;
  }
  await service.save();

  // Notify Vendor
  if (service.vendor && service.vendor.user) {
    const { sendNotification } = require('../services/notificationService');
    const title = status === 'approved' ? 'Service Approved!' : 'Service Rejected';
    const message = status === 'approved'
      ? `Your service "${service.title}" has been approved and is now live.`
      : `Your service "${service.title}" has been rejected.`;

    await sendNotification({
      recipient: service.vendor.user._id,
      sender: req.user._id,
      type: 'system',
      title,
      message,
      link: '/vendor/dashboard/services'
    });
  }

  // Socket Realtime Sync
  const io = req.app.get('io');
  if (io) {
    io.emit('service_updated', { id: service._id, status: service.status });
    io.emit('featured_vendors_updated');
    io.emit('auth-event', {
      type: 'ADMIN_ACTION',
      role: 'admin',
      message: `Service ${status}`
    });
  }

  if (status === 'approved') {
    console.log('SERVICE APPROVED');
  }

  res.status(200).json({
    status: 'success',
    message: `Service status updated to ${status}`,
    service
  });
});

// @desc    Approve a service (Admin)
// @route   PATCH /api/admin/services/:id/approve
// @access  Private (Admin)
exports.approveServiceAdmin = catchAsync(async (req, res, next) => {
  const { Service } = require('../models/index');
  const service = await Service.findById(req.params.id)
    .populate({
      path: 'vendor',
      populate: { path: 'user' }
    });

  if (!service) return next(new AppError('Service not found.', 404));

  service.status = 'approved';
  service.isActive = true;
  service.approvedBy = req.user._id;
  service.approvedAt = Date.now();
  await service.save();

  // Auto-approve the vendor if they are still pending
  if (service.vendor && service.vendor.approvalStatus === 'pending') {
    const Vendor = require('../models/Vendor');
    await Vendor.updateOne({ _id: service.vendor._id }, { $set: { approvalStatus: 'approved', isActive: true, isFeatured: true } });
  }

  // Notify Vendor
  if (service.vendor && service.vendor.user) {
    const { sendNotification } = require('../services/notificationService');
    await sendNotification({
      recipient: service.vendor.user._id,
      sender: req.user._id,
      type: 'system',
      title: 'Service Approved!',
      message: 'Your service is now live.',
      link: '/vendor/dashboard/services'
    });

      // Service Approval Email
      try {
        const { sendEmail, emailTemplates } = require('../services/emailService');
        const clientUrl = (process.env.CLIENT_URL || 'https://shaadi-saathi.vercel.app').replace(/\/$/, '');
        const template = emailTemplates.serviceApproved(
          service.vendor.user.name,
          service.title,
          clientUrl
        );
        await sendEmail({ to: service.vendor.user.email, ...template });
        console.log('[EMAIL] ✅ Service approval email sent to:', service.vendor.user.email);
      } catch (mailErr) {
        console.error('[EMAIL] ❌ SERVICE_APPROVAL_EMAIL_FAILED:');
        console.error(`[EMAIL]    → Recipient : ${service.vendor.user.email}`);
        console.error(`[EMAIL]    → Error     : ${mailErr.message}`);
      }
  }

  // Socket Realtime Sync
  const io = req.app.get('io');
  if (io) {
    io.emit('service_updated', { id: service._id, status: service.status });
    io.emit('featured_vendors_updated');
    io.emit('auth-event', {
      type: 'ADMIN_ACTION',
      role: 'admin',
      message: `Service approved`
    });
  }

  console.log('SERVICE APPROVED');

  res.status(200).json({
    status: 'success',
    message: 'Service approved successfully',
    service
  });
});

// @desc    Reject a service (Admin)
// @route   PATCH /api/admin/services/:id/reject
// @access  Private (Admin)
exports.rejectServiceAdmin = catchAsync(async (req, res, next) => {
  const { Service } = require('../models/index');
  const service = await Service.findById(req.params.id)
    .populate({
      path: 'vendor',
      populate: { path: 'user' }
    });

  if (!service) return next(new AppError('Service not found.', 404));

  service.status = 'rejected';
  service.isActive = false;
  await service.save();

  // Notify Vendor
  if (service.vendor && service.vendor.user) {
    const { sendNotification } = require('../services/notificationService');
    await sendNotification({
      recipient: service.vendor.user._id,
      sender: req.user._id,
      type: 'system',
      title: 'Service Rejected',
      message: `Your service "${service.title}" has been rejected.`,
      link: '/vendor/dashboard/services'
    });

    // Service Rejection Email
    try {
      const { sendEmail } = require('../services/emailService');
      const clientUrl = (process.env.CLIENT_URL || 'https://shaadi-saathi.vercel.app').replace(/\/$/, '');
      await sendEmail({
        to: service.vendor.user.email,
        subject: '⚠️ Your Service Has Been Rejected — ShaadiSaathi',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff">
            <div style="background:linear-gradient(135deg,#c41e6b,#e91e8c);padding:40px;text-align:center">
              <h1 style="color:white;margin:0;font-size:28px">💒 ShaadiSaathi</h1>
            </div>
            <div style="padding:40px">
              <h2 style="color:#e74c3c">⚠️ Service Submission Update</h2>
              <p style="color:#666">Hi ${service.vendor.user.name},</p>
              <p style="color:#666">Unfortunately, your service <strong>${service.title}</strong> could not be approved at this time. Please review the following and resubmit with any required corrections.</p>
              ${req.body.reason ? `<div style="background:#fff3cd;border-radius:8px;padding:16px;margin:20px 0"><strong>Reason:</strong> ${req.body.reason}</div>` : ''}
              <div style="text-align:center;margin:30px 0">
                <a href="${clientUrl}/vendor/dashboard" style="background:#333;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:bold">Visit Dashboard</a>
              </div>
              <p style="color:#999;font-size:13px">Need help? Contact us at n4narendrakr@gmail.com</p>
            </div>
            <div style="background:#f8f8f8;padding:20px;text-align:center;color:#999;font-size:12px">© 2024 ShaadiSaathi</div>
          </div>`,
      });
      console.log('[SMTP] Service rejection email sent to:', service.vendor.user.email);
    } catch (mailErr) {
      console.error('[SMTP] Failed to send service rejection email:', mailErr.message);
    }
  }

  // Socket Realtime Sync
  const io = req.app.get('io');
  if (io) {
    io.emit('service_updated', { id: service._id, status: service.status });
    io.emit('featured_vendors_updated');
  }

  res.status(200).json({
    status: 'success',
    message: 'Service rejected successfully',
    service
  });
});

// @desc    Get system configuration (Admin)
// @route   GET /api/admin/config
// @access  Private (Admin)
exports.getConfigAdmin = catchAsync(async (req, res, next) => {
  const { SystemConfig } = require('../models/index');
  let config = await SystemConfig.findOne();
  if (!config) {
    config = await SystemConfig.create({});
  }
  res.status(200).json({
    status: 'success',
    data: config
  });
});

// @desc    Update system configuration (Admin)
// @route   PATCH /api/admin/config
// @access  Private (Admin)
exports.updateConfigAdmin = catchAsync(async (req, res, next) => {
  const { SystemConfig } = require('../models/index');
  let config = await SystemConfig.findOne();
  if (!config) {
    config = await SystemConfig.create({});
  }

  const allowedUpdates = [
    'siteName', 'contactEmail', 'maintenanceMode',
    'enableRegistration', 'platformFee', 'minPayout',
    'showContactAfterBookingOnly'
  ];

  allowedUpdates.forEach(key => {
    if (req.body[key] !== undefined) {
      config[key] = req.body[key];
    }
  });

  await config.save();

  res.status(200).json({
    status: 'success',
    message: 'System configuration updated successfully',
    data: config
  });
});

// @desc    Get all vendor subscriptions (Admin)
// @route   GET /api/admin/subscriptions
// @access  Private (Admin)
exports.getSubscriptionsAdmin = catchAsync(async (req, res, next) => {
  const vendors = await Vendor.find()
    .select('businessName email approvalStatus subscription')
    .populate('user', 'name email')
    .lean();

  res.status(200).json({
    status: 'success',
    data: vendors
  });
});

// @desc    Update / Manage Vendor Subscription (Admin)
// @route   PATCH /api/admin/vendors/:id/subscription
// @access  Private (Admin)
exports.updateVendorSubscriptionAdmin = catchAsync(async (req, res, next) => {
  const { plan, action } = req.body;
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new AppError('No vendor found with that ID', 404));
  }

  // Handle actions
  if (action === 'suspend') {
    vendor.subscription.status = 'suspended';
    vendor.subscription.isActive = false;
  } else if (action === 'renew' || action === 'upgrade') {
    if (!plan || !['free', 'premium', 'elite', 'silver', 'gold', 'platinum'].includes(plan.toLowerCase())) {
      return next(new AppError('Invalid subscription plan specified', 400));
    }
    const normalizedPlan = plan.toLowerCase();
    const days = normalizedPlan === 'elite' || normalizedPlan === 'platinum' ? 365 : normalizedPlan === 'free' ? 36500 : 30;

    vendor.subscription.plan = normalizedPlan;
    vendor.subscription.status = 'active';
    vendor.subscription.startDate = new Date();
    vendor.subscription.endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    vendor.subscription.paymentStatus = 'paid';
    vendor.subscription.isActive = true;
  } else {
    return next(new AppError('Invalid action specified', 400));
  }

  await vendor.save();

  res.status(200).json({
    status: 'success',
    message: `Subscription successfully updated to ${vendor.subscription.plan} (${vendor.subscription.status})`,
    data: vendor
  });
});

// @desc    Get Vendor Availability Monitor Data
// @route   GET /api/admin/availability-monitor
// @access  Private (Admin)
exports.getAvailabilityMonitor = catchAsync(async (req, res, next) => {
  const { Vendor } = require('../models/index');

  const vendors = await Vendor.find({ approvalStatus: 'approved' })
    .populate('category', 'name')
    .select('businessName category location unavailableDates bookings availabilityStatus');

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let totalAvailable = 0;
  let totalUnavailable = 0;
  let inactiveAlerts = [];

  const mappedVendors = vendors.map(v => {
    const isUnavailableToday = v.unavailableDates && v.unavailableDates.some(d => {
      const ud = new Date(d);
      ud.setHours(0, 0, 0, 0);
      return ud.getTime() === now.getTime();
    });

    if (isUnavailableToday || v.availabilityStatus === 'unavailable') {
      totalUnavailable++;
    } else {
      totalAvailable++;
    }

    let futureBlocks = 0;
    if (v.unavailableDates) {
      futureBlocks = v.unavailableDates.filter(d => {
        const ud = new Date(d);
        ud.setHours(0, 0, 0, 0);
        return ud.getTime() >= now.getTime();
      }).length;
    }

    if (futureBlocks >= 30) {
      inactiveAlerts.push({
        vendorId: v._id,
        businessName: v.businessName,
        message: 'Vendor inactive for long period (30+ blocked dates)'
      });
    }

    return {
      _id: v._id,
      businessName: v.businessName,
      category: v.category?.name || 'Unknown',
      city: v.location?.city || 'Unknown',
      availabilityStatus: isUnavailableToday ? 'unavailable' : (v.availabilityStatus || 'available'),
      blockedDatesCount: v.unavailableDates ? v.unavailableDates.length : 0,
      upcomingBookingsCount: v.bookings ? v.bookings.length : 0,
      unavailableDates: v.unavailableDates || []
    };
  });

  const mostBooked = [...mappedVendors].sort((a, b) => b.upcomingBookingsCount - a.upcomingBookingsCount).slice(0, 5);

  res.status(200).json({
    status: 'success',
    data: {
      vendors: mappedVendors,
      stats: {
        totalAvailable,
        totalUnavailable,
        mostBooked
      },
      alerts: inactiveAlerts
    }
  });
});

// ==================== TESTIMONIALS (ADMIN) ====================

// @desc    Get all testimonials (Admin)
// @route   GET /api/admin/testimonials
// @access  Private (Admin)
exports.getAllTestimonialsAdmin = catchAsync(async (req, res, next) => {
  const { Testimonial } = require('../models/FeatureModels');
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', data: { testimonials } });
});

// @desc    Create/Update testimonial
// @route   POST /api/admin/testimonials
// @access  Private (Admin)
exports.saveTestimonial = catchAsync(async (req, res, next) => {
  const { Testimonial } = require('../models/FeatureModels');
  const { id, brideName, groomName, city, review, rating, image, video, weddingDate, servicesBooked, isVerified, isFeatured } = req.body;

  if (!brideName || !groomName || !review || !city) {
    return next(new AppError('Bride Name, Groom Name, City, and Review are required.', 400));
  }

  let testimonial;
  if (id) {
    testimonial = await Testimonial.findById(id);
    if (!testimonial) return next(new AppError('Testimonial not found', 404));

    testimonial.brideName = brideName;
    testimonial.groomName = groomName;
    testimonial.city = city;
    testimonial.review = review;
    testimonial.rating = rating || testimonial.rating;
    testimonial.image = image || testimonial.image;
    testimonial.video = video || testimonial.video;
    testimonial.weddingDate = weddingDate || testimonial.weddingDate;
    testimonial.servicesBooked = servicesBooked || testimonial.servicesBooked;
    testimonial.isVerified = isVerified !== undefined ? isVerified : testimonial.isVerified;
    testimonial.isFeatured = isFeatured !== undefined ? isFeatured : testimonial.isFeatured;

    await testimonial.save();
  } else {
    testimonial = await Testimonial.create({
      brideName, groomName, city, review, rating, image, video, weddingDate, servicesBooked, isVerified, isFeatured
    });
  }

  res.status(200).json({ status: 'success', data: { testimonial } });
});

// @desc    Delete testimonial
// @route   DELETE /api/admin/testimonials/:id
// @access  Private (Admin)
exports.deleteTestimonial = catchAsync(async (req, res, next) => {
  const { Testimonial } = require('../models/FeatureModels');
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return next(new AppError('Testimonial not found', 404));
  res.status(200).json({ status: 'success', message: 'Testimonial deleted successfully' });
});
