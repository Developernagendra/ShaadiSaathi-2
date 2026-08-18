const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { Notification, Booking, Review } = require('../models/index');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { sendEmail, emailTemplates } = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Search and Typo-tolerance Helpers
const Levenshtein = {
  get: (a, b) => {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  }
};

const SYNONYMS = {
  photography: ['photo', 'camera', 'videographer', 'shoot', 'photograph', 'studio'],
  catering: ['caterer', 'food', 'buffet', 'dine', 'lunch', 'dinner', 'plate'],
  'event-planners': ['planner', 'decor', 'decoration', 'light', 'decorator', 'theme'],
  venues: ['venue', 'hall', 'palace', 'resort', 'hotel', 'lawn', 'garden', 'mandap'],
  mehndi: ['henna', 'mehndi', 'mehendi'],
  'bridal-makeup': ['makeup', 'make up', 'bridal', 'cosmetics', 'beauty', 'parlor', 'grooming', 'makeover'],
  'tent-house': ['tent', 'decor', 'decoration', 'light', 'decorator', 'shamiana', 'pandal'],
  pandit: ['priest', 'pujari', 'pandit', 'pooja', 'puja'],
  dj: ['music', 'sound', 'band', 'speaker', 'music system'],
  'baraat-cabs': ['cab', 'ride', 'car', 'travel', 'vehicle', 'transport', 'baraat', 'auto', 'ride']
};

const INDIAN_CITIES = [
  'Patna', 'Darbhanga', 'Muzaffarpur', 'Gaya', 'Bhagalpur', 'Purnia', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar',
  'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Bettiah', 'Motihari', 'Bagaha',
  'Siwan', 'Kishanganj', 'Jamalpur', 'Buxar', 'Jehanabad', 'Aurangabad'
];

// In-memory cache for high-frequency static/config queries (5-min TTL)
let cachedSystemConfig = null;
let cachedSystemConfigExpiry = 0;
const getSystemConfigCached = async () => {
  const now = Date.now();
  if (cachedSystemConfig && now < cachedSystemConfigExpiry) {
    return cachedSystemConfig;
  }
  try {
    const SystemConfig = mongoose.model('SystemConfig');
    cachedSystemConfig = await SystemConfig.findOne().lean();
    cachedSystemConfigExpiry = now + 5 * 60 * 1000;
  } catch (e) {
    cachedSystemConfig = null;
  }
  return cachedSystemConfig;
};

let cachedCategories = null;
let cachedCategoriesExpiry = 0;
const getCategoriesCached = async () => {
  const now = Date.now();
  if (cachedCategories && now < cachedCategoriesExpiry) {
    return cachedCategories;
  }
  try {
    const { Category } = require('../models/index');
    cachedCategories = await Category.find({}).select('name slug').lean();
    cachedCategoriesExpiry = now + 10 * 60 * 1000; // 10 min TTL
  } catch (e) {
    cachedCategories = [];
  }
  return cachedCategories || [];
};

// @desc    Create vendor profile
// @route   POST /api/vendors
// @access  Private (vendor role)
const createVendorProfile = catchAsync(async (req, res, next) => {
  let vendor = await Vendor.findOne({ user: req.user._id });
  const vendorData = { ...req.body, user: req.user._id, profileCompletion: 100 };

  if (vendor) {
    if (vendor.profileCompletion > 0) {
      return next(new AppError('Vendor profile already exists.', 400));
    }
    // Update the atomic empty profile created during registration
    Object.assign(vendor, vendorData);
    await vendor.save();
  } else {
    vendor = await Vendor.create(vendorData);
  }

  // Update user role to vendor just in case
  await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

  // Trigger Real-time notifications for Vendor and Admin
  try {
    const { sendNotification } = require('../services/notificationService');

    // 1. Notify the Vendor themselves
    await sendNotification({
      recipient: req.user._id,
      sender: req.user._id,
      type: 'vendor_approval',
      title: 'Registration Submitted',
      message: `Your vendor profile for ${vendor.businessName} has been submitted successfully and is pending approval.`,
      link: '/vendor/dashboard',
      data: { vendorId: vendor._id }
    });

    // 2. Notify all Admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await sendNotification({
        recipient: admin._id,
        sender: req.user._id,
        type: 'vendor_approval',
        title: 'New Vendor Registration',
        message: `New vendor ${vendor.businessName} has registered and is awaiting approval.`,
        link: '/admin/vendors',
        data: { vendorId: vendor._id }
      });
    }
  } catch (err) {
    console.error('[VENDOR_PROFILE] ❌ In-app notification failed:', err.message);
  }

  // ── EMAIL: Welcome email to vendor + Admin notification emails ─────
  // Fire-and-forget — never block the HTTP response for email dispatch
  (async () => {
    try {
      // 1. Send vendor welcome email
      if (req.user.email) {
        const welcomeTemplate = emailTemplates.vendorWelcome(
          req.user.name,
          vendor.businessName || `${req.user.name}'s Business`
        );
        await sendEmail({ to: req.user.email, ...welcomeTemplate });
        console.log(`[VENDOR_PROFILE] ✅ Welcome email sent to vendor: ${req.user.email}`);
      }

      // 2. Send admin notification emails
      const admins = await User.find({ role: 'admin' }).lean();
      for (const admin of admins) {
        if (admin.email) {
          const adminTemplate = emailTemplates.adminVendorRegistration(
            admin.name || 'Administrator',
            {
              name: req.user.name,
              email: req.user.email || vendor.email,
              phone: req.user.phone || vendor.phone || 'Not Provided',
              businessName: vendor.businessName || 'Pending Setup',
              vendorType: vendor.vendorType || 'service',
            }
          );
          await sendEmail({ to: admin.email, ...adminTemplate });
          console.log(`[VENDOR_PROFILE] ✅ Admin notified about new vendor profile: ${admin.email}`);
        }
      }
    } catch (emailErr) {
      console.error('[VENDOR_PROFILE] ❌ EMAIL_DISPATCH_FAILED:');
      console.error(`[VENDOR_PROFILE]    → Error : ${emailErr.message}`);
    }
  })();

  res.status(201).json({
    status: 'success',
    message: 'Vendor profile created. Awaiting admin approval.',
    vendor
  });
});

const getMyVendorProfile = catchAsync(async (req, res, next) => {
  const { vendorId } = req.query;

  console.log('FETCHING VENDOR PROFILE');

  let query;
  if (req.user.role === 'admin' && vendorId) {
    query = { _id: vendorId };
  } else {
    query = { user: req.user._id };
  }

  let vendor = await Vendor.findOne(query)
    .populate('category', 'name slug icon')
    .populate('user', 'name email phone avatar isVerified')
    .lean();

  if (!vendor && req.user.role === 'vendor' && !vendorId) {
    console.log('VENDOR PROFILE NOT FOUND IN getMyVendorProfile - AUTO-CREATING FAIL-SAFE PROFILE');
    const newProfile = await Vendor.create({
      user: req.user._id,
      businessName: `${req.user.name}'s Business (Pending)`,
      email: req.user.email,
      phone: req.user.phone || '0000000000',
      approvalStatus: 'pending',
      profileCompletion: 0,
    });

    // Import User model explicitly if needed
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { vendorProfile: newProfile._id });

    vendor = await Vendor.findById(newProfile._id)
      .populate('category', 'name slug icon')
      .populate('user', 'name email phone avatar isVerified')
      .lean();
  }

  if (!vendor) {
    return res.status(200).json({
      status: 'success',
      vendor: null
    });
  }

  console.log('VENDOR PROFILE FOUND');

  res.status(200).json({
    status: 'success',
    vendor
  });
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private (vendor)
const updateVendorProfile = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return next(new AppError('Vendor profile not found.', 404));

  const restricted = ['user', 'approvalStatus', 'totalBookings', 'totalEarnings', 'rating', 'approvedAt', 'approvedBy'];
  restricted.forEach((field) => delete req.body[field]);

  // Handle nested location if sent flat
  if (req.body.city !== undefined || req.body.address !== undefined || req.body.state !== undefined || req.body.pincode !== undefined) {
    if (!vendor.location) vendor.location = {};
    if (req.body.city !== undefined) vendor.location.city = req.body.city;
    if (req.body.address !== undefined) vendor.location.address = req.body.address;
    if (req.body.state !== undefined) vendor.location.state = req.body.state;
    if (req.body.pincode !== undefined) vendor.location.pincode = req.body.pincode;

    delete req.body.city;
    delete req.body.address;
    delete req.body.state;
    delete req.body.pincode;
  }

  // Handle category if sent as slug
  if (req.body.category) {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
      const Category = require('../models/Category');
      const catObj = await Category.findOne({ slug: req.body.category.toLowerCase() });
      if (catObj) {
        req.body.category = catObj._id;
      } else {
        return next(new AppError('Invalid category selected.', 400));
      }
    }
  }

  // Handle social links if sent flat
  if (req.body.instagram !== undefined || req.body.facebook !== undefined || req.body.website !== undefined || req.body.youtube !== undefined) {
    if (!vendor.socialLinks) vendor.socialLinks = {};
    if (req.body.instagram !== undefined) vendor.socialLinks.instagram = req.body.instagram;
    if (req.body.facebook !== undefined) vendor.socialLinks.facebook = req.body.facebook;
    if (req.body.website !== undefined) vendor.socialLinks.website = req.body.website;
    if (req.body.youtube !== undefined) vendor.socialLinks.youtube = req.body.youtube;

    delete req.body.instagram;
    delete req.body.facebook;
    delete req.body.website;
    delete req.body.youtube;
  }

  // --- Packages: validate, sanitize and save ---
  if (req.body.packages !== undefined && Array.isArray(req.body.packages)) {
    const rawPackages = req.body.packages;
    let minPrice = Infinity;
    const cleanedPackages = [];

    for (let i = 0; i < rawPackages.length; i++) {
      const pkg = rawPackages[i];
      if (!pkg.name || !String(pkg.name).trim()) {
        return next(new AppError(`Package ${i + 1}: name is required.`, 400));
      }
      const parsedPrice = Number(pkg.price);
      if (!parsedPrice || parsedPrice <= 0) {
        return next(new AppError(`Package "${pkg.name}": price must be greater than 0.`, 400));
      }
      if (parsedPrice < minPrice) minPrice = parsedPrice;

      cleanedPackages.push({
        name: String(pkg.name).trim(),
        description: pkg.description ? String(pkg.description).trim() : '',
        price: parsedPrice,
        advancePercentage: Number(pkg.advancePercentage) || 50,
        features: Array.isArray(pkg.features) ? pkg.features.filter(f => f && String(f).trim()) : [],
        isPopular: Boolean(pkg.isPopular),
      });
    }

    // Use direct assignment so Mongoose marks the array as modified
    vendor.packages = cleanedPackages;
    vendor.markModified('packages');

    if (minPrice !== Infinity) {
      vendor.basePrice = minPrice;
      vendor.price = minPrice;
    }

    // Remove from req.body so Object.assign below doesn't overwrite it
    delete req.body.packages;
  }

  // Handle price and basePrice explicitly
  if (req.body.basePrice !== undefined || req.body.price !== undefined) {
    const rawPrice = req.body.basePrice !== undefined ? req.body.basePrice : req.body.price;
    const numPrice = Number(rawPrice);
    if (!isNaN(numPrice) && numPrice >= 0) {
      vendor.basePrice = numPrice;
      vendor.price = numPrice;
      delete req.body.basePrice;
      delete req.body.price;
    }
  }

  Object.assign(vendor, req.body);

  await vendor.save();

  // Populate necessary fields before returning to frontend
  await vendor.populate('category', 'name slug icon');
  await vendor.populate('user', 'name email avatar');

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    vendor
  });
});

// @desc    Upload vendor images
// @route   POST /api/vendors/images
// @access  Private (vendor)
const uploadVendorImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image.', 400));
  }

  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return next(new AppError('Vendor profile not found.', 404));

  // Limit Free tier to 5 gallery images
  const isPremiumOrElite = vendor.subscription?.status === 'active' &&
    ['premium', 'elite', 'silver', 'gold', 'platinum'].includes(vendor.subscription?.plan);

  if (!isPremiumOrElite && (vendor.images.length + req.files.length) > 5) {
    return next(new AppError('Free tier accounts are limited to a maximum of 5 gallery images. Please upgrade to Premium or Elite for unlimited image uploads!', 400));
  }

  const newImages = req.files.map((file, index) => ({
    url: file.path,
    publicId: file.filename,
    isPrimary: vendor.images.length === 0 && index === 0,
  }));

  vendor.images.push(...newImages);
  await vendor.save();

  res.status(200).json({
    status: 'success',
    message: 'Images uploaded successfully.',
    images: vendor.images
  });
});

// @desc    Delete vendor image
// @route   DELETE /api/vendors/images/:imageId
// @access  Private (vendor)
const deleteVendorImage = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return next(new AppError('Vendor profile not found.', 404));

  const image = vendor.images.id(req.params.imageId);
  if (!image) return next(new AppError('Image not found.', 404));

  if (image.publicId) await deleteFromCloudinary(image.publicId);
  vendor.images.pull(req.params.imageId);
  await vendor.save();

  res.status(200).json({
    status: 'success',
    message: 'Image deleted successfully.'
  });
});

// @desc    Upload vendor cover image
// @route   POST /api/vendors/cover-image
// @access  Private (vendor)
const uploadVendorCoverImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image.', 400));
  }

  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return next(new AppError('Vendor profile not found.', 404));

  // Delete old cover image if exists
  if (vendor.coverImage?.publicId) {
    await deleteFromCloudinary(vendor.coverImage.publicId);
  }

  vendor.coverImage = {
    url: req.file.path,
    publicId: req.file.filename,
  };
  await vendor.save();

  res.status(200).json({
    status: 'success',
    message: 'Cover image updated successfully.',
    coverImage: vendor.coverImage
  });
});

// @desc    Get all vendors with search & filters
// @route   GET /api/vendors
// @access  Public
const getAllVendors = catchAsync(async (req, res, next) => {
  const {
    page = 1, limit = 12, city, category, district, rating,
    verified, featured, premium, priceMin, priceMax, minPrice, maxPrice,
    sort, sortBy = 'createdAt', order = 'desc', experience, marketplace, date, search
  } = req.query;

  const query = {
    approvalStatus: 'approved',
    isActive: true
  };

  // Prevent Regex and Mongo injection by sanitizing string parameters
  const escapeRegex = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/[$.]/g, '');
  };

  const pMin = priceMin || minPrice;
  const pMax = priceMax || maxPrice;

  // --- Marketplace separation by vendorType ---
  if (marketplace === 'cabs') {
    query.vendorType = 'cab';
  } else {
    query.$or = [
      { vendorType: 'service' },
      { vendorType: { $exists: false } },
      { vendorType: null }
    ];
  }

  // Handle explicit filters
  if (district) {
    query['location.address'] = { $regex: escapeRegex(district), $options: 'i' };
  }

  if (rating) {
    query['rating.average'] = { $gte: Number(rating) };
  }

  if (verified === 'true') {
    query.badges = 'verified';
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  if (premium === 'true') {
    query['subscription.plan'] = { $in: ['premium', 'elite', 'gold', 'platinum'] };
    query['subscription.status'] = 'active';
  }

  if (pMin || pMax) {
    query.basePrice = {};
    if (pMin) query.basePrice.$gte = Number(pMin);
    if (pMax) query.basePrice.$lte = Number(pMax);
  }

  if (experience) {
    if (experience === '1-3') query.yearsOfExperience = { $gte: 1, $lte: 3 };
    else if (experience === '3-5') query.yearsOfExperience = { $gte: 3, $lte: 5 };
    else if (experience === '5-10') query.yearsOfExperience = { $gte: 5, $lte: 10 };
    else if (experience === '10+') query.yearsOfExperience = { $gte: 10 };
  }

  if (date) {
    const requestedDate = new Date(date);
    const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));
    query.unavailableDates = {
      $not: {
        $elemMatch: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    };
  }

  let parsedCity = city ? city.trim() : '';
  let parsedCategoryIds = [];
  const searchOrConditions = [];

  if (search) {
    const searchTerms = search.trim().split(/\s+/).filter(Boolean);
    const allCategories = await getCategoriesCached();

    for (const term of searchTerms) {
      const termLower = term.toLowerCase();

      // Typo-tolerant City check
      const matchedCity = INDIAN_CITIES.find(c => {
        const cLower = c.toLowerCase();
        if (cLower === termLower) return true;
        if (c.length > 4 && Levenshtein.get(cLower, termLower) <= 1) return true;
        return false;
      });

      if (matchedCity) {
        parsedCity = matchedCity;
        continue;
      }

      // Typo-tolerant Category check
      const matchedCategories = allCategories.filter(cat => {
        const catLower = cat.name.toLowerCase();
        const slugLower = cat.slug.toLowerCase();
        if (catLower.includes(termLower) || slugLower.includes(termLower)) return true;
        if (cat.name.length > 4 && (
          Levenshtein.get(catLower, termLower) <= 2 ||
          Levenshtein.get(slugLower, termLower) <= 2
        )) return true;
        return false;
      });

      if (matchedCategories.length > 0) {
        parsedCategoryIds.push(...matchedCategories.map(c => c._id));
        continue;
      }

      // Synonym check
      let synonymMatched = false;
      for (const [key, values] of Object.entries(SYNONYMS)) {
        if (values.some(v => termLower.includes(v)) || termLower.includes(key)) {
          const matchingCats = allCategories.filter(cat => cat.slug.toLowerCase() === key || cat.name.toLowerCase() === key);
          if (matchingCats.length > 0) {
            parsedCategoryIds.push(...matchingCats.map(c => c._id));
            synonymMatched = true;
          }
        }
      }
      if (synonymMatched) continue;

      // Construct a typo-tolerant regex for standard term search
      const escapedTerm = escapeRegex(term);
      let termRegex = new RegExp(escapedTerm, 'i');
      if (term.length > 4) {
        const chars = term.split('');
        const subPatterns = chars.map((_, idx) => {
          const substituted = [...chars];
          substituted[idx] = '.';
          return substituted.join('');
        });
        termRegex = new RegExp(`(${subPatterns.join('|')})`, 'i');
      }

      searchOrConditions.push(
        { businessName: termRegex },
        { description: termRegex },
        { tagline: termRegex },
        { specializations: termRegex },
        { 'location.address': termRegex },
        { 'location.state': termRegex },
        { 'packages.name': termRegex },
        { 'packages.description': termRegex },
        { 'packages.features': termRegex }
      );
    }

    const termQueries = [];
    if (searchOrConditions.length > 0) {
      termQueries.push({ $or: searchOrConditions });
    }
    if (parsedCategoryIds.length > 0) {
      termQueries.push({ category: { $in: parsedCategoryIds } });
    }

    // Search User Name
    const User = require('../models/User');
    const escapedSearch = escapeRegex(search);
    const matchedUsers = await User.find({ name: { $regex: escapedSearch, $options: 'i' } }).select('_id');
    if (matchedUsers.length > 0) {
      termQueries.push({ user: { $in: matchedUsers.map(u => u._id) } });
    }

    if (termQueries.length > 0) {
      query.$or = termQueries;
    }
  }

  if (parsedCity) {
    query['location.city'] = { $regex: escapeRegex(parsedCity), $options: 'i' };
  }

  // Handle explicit category filter if present
  if (category) {
    const { Category } = require('../models/index');
    const mongoose = require('mongoose');

    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const catObj = await Category.findOne({ slug: category.toLowerCase() });
      if (catObj) {
        query.category = catObj._id;
      } else {
        return res.status(200).json({
          status: 'success',
          vendors: [],
          total: 0,
          totalPages: 0,
          currentPage: Number(page),
          pagination: { total: 0, page: Number(page), pages: 0, limit: Number(limit) },
          filters: {}
        });
      }
    }
  }

  const pipeline = [
    { $match: query },
    {
      $addFields: {
        searchRankScore: {
          $cond: [
            {
              $and: [
                { $eq: ['$subscription.plan', 'elite'] },
                { $eq: ['$subscription.status', 'active'] }
              ]
            },
            1000,
            {
              $cond: [
                {
                  $and: [
                    { $eq: ['$subscription.plan', 'premium'] },
                    { $eq: ['$subscription.status', 'active'] }
                  ]
                },
                100,
                {
                  $cond: [
                    { $in: ['verified', { $ifNull: ['$badges', []] }] },
                    10,
                    1
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  ];

  const sortOptions = {};
  if (sort) {
    switch (sort) {
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'rating':
      case 'highest-rating':
        sortOptions['rating.average'] = -1;
        break;
      case 'price-asc':
      case 'lowest-price':
        sortOptions.basePrice = 1;
        break;
      case 'price-desc':
      case 'highest-price':
        sortOptions.basePrice = -1;
        break;
      case 'popular':
      case 'most-popular':
        sortOptions.views = -1;
        break;
      case 'bookings':
      case 'most-booked':
        sortOptions.totalBookings = -1;
        break;
      case 'verified-first':
      case 'verified':
        sortOptions.searchRankScore = -1;
        break;
      case 'featured-first':
      case 'featured':
        sortOptions.isFeatured = -1;
        break;
      case 'premium-first':
      case 'premium':
        sortOptions.searchRankScore = -1;
        break;
      default:
        sortOptions.searchRankScore = -1;
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }
  } else {
    sortOptions.searchRankScore = -1;
    if (sortBy === 'price') sortOptions.basePrice = order === 'asc' ? 1 : -1;
    else if (sortBy === 'rating') sortOptions['rating.average'] = -1;
    else if (sortBy === 'bookings') sortOptions.totalBookings = -1;
    else sortOptions[sortBy] = order === 'asc' ? 1 : -1;
  }

  pipeline.push({ $sort: sortOptions });
  pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
  pipeline.push({ $limit: Number(limit) });

  const total = await Vendor.countDocuments(query);
  let vendors = await Vendor.aggregate(pipeline);

  // Populate category and user details
  vendors = await Vendor.populate(vendors, [
    { path: 'category', select: 'name slug icon' },
    { path: 'user', select: 'name avatar' }
  ]);

  // Redact addresses on lists when contact protection is enabled
  const config = await getSystemConfigCached();
  const showContactAfterBookingOnly = config ? config.showContactAfterBookingOnly : true;

  if (showContactAfterBookingOnly) {
    vendors.forEach(v => {
      if (v.location) {
        v.location.address = '';
        v.location.pincode = '';
      }
      v.phone = '';
      v.email = '';
    });
  }

  res.status(200).json({
    status: 'success',
    vendors,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    filters: {
      city: parsedCity || null,
      category: category || null,
      district: district || null,
      rating: rating || null,
      verified: verified === 'true',
      featured: featured === 'true',
      premium: premium === 'true',
      priceMin: pMin || null,
      priceMax: pMax || null,
      sort: sort || null
    }
  });
});

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('category', 'name slug icon')
    .populate('user', 'name email avatar')
    .select('-bankDetails -verificationDocuments -gstNumber')
    .lean();

  if (!vendor) {
    return next(new AppError('Vendor not found.', 404));
  }

  let isAuthorized = false;
  if (req.user) {
    if (req.user.role === 'admin') {
      isAuthorized = true;
    } else if (req.user._id.toString() === vendor.user?._id?.toString() || req.user._id.toString() === vendor.user?.toString()) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    if (vendor.approvalStatus !== 'approved' || vendor.isActive === false) {
      return next(new AppError('The profile you are looking for has been removed or is currently private.', 404));
    }
  }

  // Check contact protection configuration
  const SystemConfig = mongoose.model('SystemConfig');
  const Booking = mongoose.model('Booking');
  const Chat = mongoose.model('Chat');
  const Lead = mongoose.model('Lead');
  const Review = mongoose.model('Review');
  const config = await SystemConfig.findOne();
  const showContactAfterBookingOnly = config ? config.showContactAfterBookingOnly : true;

  let isUnlocked = true;

  if (showContactAfterBookingOnly) {
    isUnlocked = false;

    // Check if the user is authorized to bypass protection
    if (req.user) {
      const isSelf = req.user._id.toString() === vendor.user?._id?.toString() ||
        req.user._id.toString() === vendor.user?.toString();

      if (req.user.role === 'admin' || isSelf) {
        isUnlocked = true;
      } else {
        const bookingCount = await Booking.countDocuments({
          user: req.user._id,
          vendorProfileId: vendor._id,
          status: { $in: ['confirmed', 'completed', 'pending', 'in_progress', 'on_the_way'] }
        });

        if (bookingCount > 0) {
          isUnlocked = true;
        }
      }
    }
  }

  // Redact contact info if not unlocked
  if (!isUnlocked) {
    vendor.phone = '';
    vendor.alternatePhone = '';
    vendor.email = '';
    if (vendor.location) {
      vendor.location.address = 'Available after Booking or Inquiry';
      vendor.location.pincode = '';
    }
    vendor.socialLinks = {
      instagram: '',
      facebook: '',
      youtube: '',
      website: ''
    };
    vendor.isContactLocked = true;
  } else {
    vendor.isContactLocked = false;
  }

  // --- DYNAMIC DATA ENHANCEMENTS ---

  // 1. Calculate dynamic completed bookings
  const completedBookings = await Booking.countDocuments({
    vendorId: vendor.user?._id || vendor.user,
    status: 'completed'
  });
  vendor.completedBookings = completedBookings;

  // 2. Calculate experience from createdAt if not set
  let exp = vendor.yearsOfExperience;
  if (!exp) {
    const startYear = new Date(vendor.createdAt || Date.now()).getFullYear();
    const currentYear = new Date().getFullYear();
    exp = currentYear - startYear;
    if (exp === 0) exp = 1; // Minimum 1 year
  }
  vendor.calculatedExperience = exp;

  // 3. Ensure Category Exists
  if (!vendor.category) {
    vendor.category = { name: 'Wedding Service', slug: 'wedding-service' };
  }

  // 4. Calculate Dynamic Rating from actual Review collection
  const reviews = await Review.find({ vendor: vendor._id }).select('rating');
  let totalRating = 0;
  reviews.forEach(r => { totalRating += r.rating; });
  const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

  vendor.dynamicRating = {
    average: parseFloat(avgRating),
    count: reviews.length
  };

  // 5. Set default response time
  if (!vendor.responseTime) {
    vendor.responseTime = 'Usually 1hr';
  }

  // ---------------------------------

  // Increment views in background
  Vendor.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(e => console.error('View inc error:', e));

  res.status(200).json({
    status: 'success',
    vendor
  });
});

// @desc    Approve/Reject vendor (Admin)
// @route   PATCH /api/vendors/:id/approval
// @access  Admin
const updateVendorApproval = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;

  if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
    return next(new AppError('Invalid approval status provided.', 400));
  }

  const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');
  if (!vendor) return next(new AppError('Vendor profile not found.', 404));

  // Sync approval status
  vendor.approvalStatus = status;
  vendor.approvalNote = note || vendor.approvalNote;

  if (status === 'approved') {
    vendor.approvedAt = Date.now();
    vendor.approvedBy = req.user._id;
    // CRITICAL: Update user role to vendor upon approval
    const User = require('../models/User');
    if (vendor.user && vendor.user._id) {
      await User.findByIdAndUpdate(vendor.user._id, { role: 'vendor' });
    }
  } else if (status === 'suspended' || status === 'rejected') {
    // Optional: Downgrade role if suspended? Usually we keep it as vendor but block access via middleware
  }

  await vendor.save();

  // Send email notification (Fail-safe)
  try {
    if (emailTemplates && emailTemplates.vendorApproval) {
      const template = emailTemplates.vendorApproval(vendor.user.name, status);
      await sendEmail({ to: vendor.user.email, ...template });
      console.log(`[VENDOR_APPROVAL] ✅ Approval email sent to: ${vendor.user.email} (status: ${status})`);
    }
  } catch (err) {
    console.error('[VENDOR_APPROVAL] ❌ APPROVAL_EMAIL_FAILED:');
    console.error(`[VENDOR_APPROVAL]    → Vendor : ${vendor.user.email}`);
    console.error(`[VENDOR_APPROVAL]    → Status : ${status}`);
    console.error(`[VENDOR_APPROVAL]    → Error  : ${err.message}`);
  }

  // Create system notification
  try {
    const { sendNotification } = require('../services/notificationService');
    await sendNotification({
      recipient: vendor.user._id,
      sender: req.user._id,
      type: 'vendor_approval',
      title: status === 'approved' ? 'Partner Account Approved! 🎉' : 'Vendor Status Update',
      message: status === 'approved'
        ? 'Congratulations! Your vendor profile has been approved. You can now start adding services and receiving bookings.'
        : `Your vendor account status has been updated to ${status}. ${note ? 'Reason: ' + note : ''}`,
      link: '/vendor/dashboard',
      data: { vendorId: vendor._id }
    });
  } catch (err) {
    console.error('Vendor approval notification failed:', err);
  }

  res.status(200).json({
    status: 'success',
    message: `Vendor account ${status} successfully.`,
    data: { vendor }
  });
});

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard
// @access  Private (vendor)
const getVendorDashboard = catchAsync(async (req, res, next) => {
  const { vendorId } = req.query;

  const mongoose = require('mongoose');
  let queryVendor;

  if (req.user.role === 'admin' && vendorId && vendorId !== 'null' && vendorId !== 'undefined') {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return next(new AppError('Invalid Vendor ID format', 400));
    }
    queryVendor = await Vendor.findById(vendorId).lean();
  } else {
    queryVendor = await Vendor.findOne({ user: req.user._id }).lean();
  }

  if (!queryVendor && req.user.role === 'vendor' && (!vendorId || vendorId === 'null')) {
    console.log('VENDOR PROFILE NOT FOUND IN getVendorDashboard - AUTO-CREATING FAIL-SAFE PROFILE');
    queryVendor = await Vendor.create({
      user: req.user._id,
      businessName: `${req.user.name}'s Business (Pending)`,
      email: req.user.email,
      phone: req.user.phone || '0000000000',
      approvalStatus: 'pending',
      profileCompletion: 0,
    });
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { vendorProfile: queryVendor._id });

    queryVendor = await Vendor.findById(queryVendor._id).lean();
  }

  if (!queryVendor) {
    return res.status(200).json({
      status: 'success',
      message: 'No vendor profile associated with this account.',
      vendor: null,
      stats: { totalBookings: 0, totalEarnings: 0, pendingBookings: 0, confirmedBookings: 0, completedBookings: 0, cancelledBookings: 0, totalCabs: 0 }
    });
  }

  const vendor = queryVendor;

  console.time('vendorDashboard-AggregateQuery');
  const [
    bookingStats, recentBookings, recentReviews, monthlyBookings,
    cabStats, recentCabBookings, monthlyCabBookings, totalCabs,
    paymentStats
  ] = await Promise.all([
    // 1. Service Stats
    Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), bookingType: 'service' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
    ]),
    Booking.find({ vendorId: vendor.user, bookingType: 'service' })
      .select('bookingId userId contactName eventDate status amount createdAt bookingType')
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Review.find({ vendor: vendor._id })
      .select('user rating comment createdAt')
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), status: 'completed', bookingType: 'service' } },
      {
        $group: {
          _id: {
            year: { $year: '$eventDate' },
            month: { $month: '$eventDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]),
    // 2. Cab Stats
    Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), bookingType: { $in: ['cab', 'baraat-cab'] } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
    ]),
    Booking.find({ vendorId: vendor.user, bookingType: { $in: ['cab', 'baraat-cab'] } })
      .select('bookingId userId contactName eventDate status amount createdAt bookingType vehicles pickupLocation cabIds')
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), status: 'completed', bookingType: { $in: ['cab', 'baraat-cab'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$eventDate' },
            month: { $month: '$eventDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]),
    require('../models/index').Cab.countDocuments({ vendor: vendor._id }),
    // 3. Payment Stats
    Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user) } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          revenue: {
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
    ])
  ]);
  console.timeEnd('vendorDashboard-AggregateQuery');

  // Dynamic Daily Fleet Inventory Stats for Vendor Dashboard
  const CabModel = require('../models/index').Cab;
  const vendorCabs = await CabModel.find({ vendor: vendor._id }).lean();
  const totalVehiclesCount = vendorCabs.reduce((acc, curr) => acc + (curr.totalFleet || curr.quantityAvailable || 1), 0);

  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
  const activeBookingsToday = await Booking.find({
    vendorId: vendor.user,
    eventDate: { $gte: startOfToday, $lte: endOfToday },
    status: { $in: ['confirmed', 'in_progress', 'on_the_way'] },
    bookingType: { $in: ['cab', 'baraat-cab'] }
  }).lean();

  let bookedVehiclesCount = 0;
  activeBookingsToday.forEach(b => {
    if (b.fleetSelection && b.fleetSelection.length > 0) {
      b.fleetSelection.forEach(item => {
        const hasMyCab = vendorCabs.some(c => c._id.toString() === item.cabId?.toString());
        if (hasMyCab) bookedVehiclesCount += (item.count || 1);
      });
    } else if (b.vehicles && b.vehicles.length > 0 && b.cabIds) {
      b.cabIds.forEach((id, idx) => {
        const hasMyCab = vendorCabs.some(c => c._id.toString() === id.toString());
        if (hasMyCab) bookedVehiclesCount += (b.vehicles[idx]?.count || 1);
      });
    } else {
      if (b.cab && vendorCabs.some(c => c._id.toString() === b.cab.toString())) {
        bookedVehiclesCount += 1;
      }
    }
  });

  const availableVehiclesCount = Math.max(0, totalVehiclesCount - bookedVehiclesCount);

  let soldOutVehiclesCount = 0;
  vendorCabs.forEach(cab => {
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

  const totalCount = bookingStats.reduce((acc, curr) => acc + curr.count, 0) + cabStats.reduce((acc, curr) => acc + curr.count, 0);

  const totalEarnings = (bookingStats.find(s => s._id === 'completed')?.revenue || 0) + (cabStats.find(s => s._id === 'completed')?.revenue || 0);

  const paidCount = paymentStats.find(p => ['paid', 'fully_paid'].includes(p._id))?.count || 0;
  const paidEarnings = paymentStats.find(p => ['paid', 'fully_paid'].includes(p._id))?.revenue || 0;
  const pendingCount = paymentStats.find(p => ['pending', 'failed', 'unpaid'].includes(p._id))?.count || 0;
  const pendingEarnings = paymentStats.find(p => ['pending', 'failed', 'unpaid'].includes(p._id))?.revenue || 0;
  const partialPaidCount = paymentStats.find(p => ['partial_paid', 'advance_paid'].includes(p._id))?.count || 0;
  const partialPaidEarnings = paymentStats.find(p => ['partial_paid', 'advance_paid'].includes(p._id))?.revenue || 0;

  const stats = {
    totalBookings: totalCount,
    totalEarnings: totalEarnings || vendor.totalEarnings || 0,
    rating: vendor.rating,
    views: vendor.views,
    enquiries: vendor.enquiries,
    pendingBookings: (bookingStats.find(s => s._id === 'pending')?.count || 0) + (cabStats.find(s => s._id === 'pending')?.count || 0),
    confirmedBookings: (bookingStats.find(s => s._id === 'confirmed')?.count || 0) + (cabStats.find(s => s._id === 'confirmed')?.count || 0),
    completedBookings: (bookingStats.find(s => s._id === 'completed')?.count || 0) + (cabStats.find(s => s._id === 'completed')?.count || 0),
    cancelledBookings: (bookingStats.find(s => ['cancelled', 'rejected'].includes(s._id))?.count || 0) + (cabStats.find(s => ['cancelled', 'rejected'].includes(s._id))?.count || 0),
    totalCabs: totalCabs || 0,
    totalVehicles: totalVehiclesCount,
    bookedVehicles: bookedVehiclesCount,
    availableVehicles: availableVehiclesCount,
    soldOutVehicles: soldOutVehiclesCount,
    paymentStats: {
      paid: { count: paidCount, earnings: paidEarnings },
      pending: { count: pendingCount, earnings: pendingEarnings },
      partialPaid: { count: partialPaidCount, earnings: partialPaidEarnings }
    }
  };

  res.status(200).json({
    status: 'success',
    vendor,
    stats,
    bookingStats,
    cabStats,
    recentBookings,
    recentCabBookings,
    recentReviews,
    monthlyBookings,
    monthlyCabBookings
  });
});

// @desc    Manage availability calendar
// @route   POST /api/vendors/availability
// @access  Private (vendor)
const updateAvailability = catchAsync(async (req, res, next) => {
  const { dates, action } = req.body; // action: 'block' or 'unblock'
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return next(new AppError('Vendor not found.', 404));

  if (!vendor.unavailableDates) vendor.unavailableDates = [];

  if (action === 'block') {
    const newDates = dates.map((d) => ({ date: new Date(d), isBooked: true }));
    vendor.availability.push(...newDates);

    dates.forEach(d => {
      const eDate = new Date(d);
      eDate.setHours(0, 0, 0, 0);
      const exists = vendor.unavailableDates.some(ud => {
        const dObj = new Date(ud);
        dObj.setHours(0, 0, 0, 0);
        return dObj.getTime() === eDate.getTime();
      });
      if (!exists) vendor.unavailableDates.push(eDate);
    });
  } else {
    vendor.availability = vendor.availability.filter(
      (a) => !dates.includes(a.date.toISOString().split('T')[0])
    );

    vendor.unavailableDates = vendor.unavailableDates.filter(ud => {
      const dObj = new Date(ud);
      dObj.setHours(0, 0, 0, 0);
      const dateStr = dObj.toISOString().split('T')[0];
      return !dates.includes(dateStr);
    });
  }

  await vendor.save();
  res.status(200).json({
    status: 'success',
    message: 'Availability updated.',
    availability: vendor.availability
  });
});

// @desc    Get featured vendors
// @route   GET /api/vendors/featured
// @access  Public
const getFeaturedVendors = catchAsync(async (req, res, next) => {
  const typeFilter = req.query.vendorType === 'cab'
    ? { vendorType: 'cab' }
    : { $or: [{ vendorType: 'service' }, { vendorType: { $exists: false } }, { vendorType: null }] };

  const pipeline = [
    {
      $match: {
        approvalStatus: 'approved',
        isActive: true,
        $or: [
          { isFeatured: true },
          {
            $and: [
              { 'subscription.plan': { $in: ['premium', 'elite', 'silver', 'gold', 'platinum'] } },
              { 'subscription.status': 'active' }
            ]
          }
        ],
        ...typeFilter
      }
    },
    {
      $addFields: {
        featuredScore: {
          $cond: [
            {
              $and: [
                { $eq: ['$subscription.plan', 'elite'] },
                { $eq: ['$subscription.status', 'active'] }
              ]
            },
            1000,
            {
              $cond: [
                {
                  $and: [
                    { $eq: ['$subscription.plan', 'premium'] },
                    { $eq: ['$subscription.status', 'active'] }
                  ]
                },
                100,
                {
                  $cond: [
                    { $eq: ['$isFeatured', true] },
                    10,
                    1
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    { $sort: { featuredScore: -1, createdAt: -1 } },
    { $limit: 10 },
    {
      $project: {
        businessName: 1,
        tagline: 1,
        images: 1,
        coverImage: 1,
        basePrice: 1,
        location: 1,
        rating: 1,
        category: 1,
        isFeatured: 1,
        isTrending: 1,
        yearsOfExperience: 1,
        responseTime: 1,
        user: 1,
        featuredScore: 1
      }
    }
  ];

  let vendors = await Vendor.aggregate(pipeline);
  vendors = await Vendor.populate(vendors, [
    { path: 'category', select: 'name slug icon' },
    { path: 'user', select: 'name avatar' }
  ]);

  console.log(`[DEBUG] Fetched ${vendors ? vendors.length : 0} explicitly featured vendors.`);

  // FALLBACK LOGIC: If no featured vendors exist, fallback to displaying approved and active vendors
  if (!vendors || vendors.length === 0) {
    console.log('[DEBUG] No explicitly featured vendors found. Falling back to active and approved vendors.');
    vendors = await Vendor.find({
      approvalStatus: 'approved',
      isActive: true,
      ...typeFilter
    })
      .populate('category', 'name slug icon')
      .populate('user', 'name avatar')
      .select('businessName tagline images coverImage basePrice location rating category isFeatured isTrending yearsOfExperience responseTime')
      .limit(8)
      .lean();
    console.log(`[DEBUG] Fallback fetch complete. Loaded ${vendors ? vendors.length : 0} approved vendors.`);
  }

  // Redact addresses on lists when contact protection is enabled
  const SystemConfig = mongoose.model('SystemConfig');
  const config = await SystemConfig.findOne();
  const showContactAfterBookingOnly = config ? config.showContactAfterBookingOnly : true;

  if (showContactAfterBookingOnly) {
    vendors.forEach(v => {
      if (v.location) {
        v.location.address = '';
        v.location.pincode = '';
      }
      v.phone = '';
      v.email = '';
    });
  }

  res.status(200).json({
    success: true,
    status: 'success',
    vendors
  });
});

const activateSubscription = catchAsync(async (req, res, next) => {
  const { planName } = req.body;
  const normalizedPlanName = planName?.toLowerCase();

  if (!planName || !['free', 'premium', 'elite', 'silver', 'gold', 'platinum'].includes(normalizedPlanName)) {
    return next(new AppError('Invalid subscription plan name', 400));
  }

  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) return next(new AppError('Vendor profile not found.', 404));

  let durationDays = 30; // default Premium
  if (normalizedPlanName === 'elite' || normalizedPlanName === 'platinum') {
    durationDays = 365;
  } else if (normalizedPlanName === 'free') {
    durationDays = 36500; // 100 years
  }

  vendor.subscription = {
    plan: normalizedPlanName,
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    paymentStatus: 'paid',
    paymentId: `one_click_${normalizedPlanName}_activation`,
    autoRenew: true
  };

  await vendor.save();

  res.status(200).json({
    status: 'success',
    message: `Plan ${planName} activated successfully.`,
    vendor
  });
});

// @desc    Get leads pipeline for vendor
// @route   GET /api/vendors/leads/pipeline
// @access  Private (vendor)
const getVendorLeadsPipeline = catchAsync(async (req, res, next) => {
  const { Lead, Booking } = require('../models/index');
  const vendor = await Vendor.findOne({ user: req.user._id });

  if (!vendor) return next(new AppError('Vendor profile not found', 404));

  // 1. Get leads where vendor has sent quotations
  const leads = await Lead.find({
    'quotations.vendor': vendor._id
  }).populate('user', 'name avatar email phone').populate('serviceType', 'name').lean();

  // 2. Get un-quoted leads in vendor's city/category (New Leads)
  const newLeads = await Lead.find({
    city: vendor.location.city,
    serviceType: vendor.category,
    status: 'open',
    'quotations.vendor': { $ne: vendor._id }
  }).populate('user', 'name avatar email phone').populate('serviceType', 'name').lean();

  // 3. Get Bookings mapped as converted leads
  const bookings = await Booking.find({
    $or: [{ vendorId: vendor.user._id }, { vendorId: vendor.user }]
  }).populate('userId', 'name avatar email phone').lean();

  // 4. Get Direct WhatsApp Leads
  const VendorLead = require('../models/VendorLead');
  const directLeads = await VendorLead.find({ vendor: vendor._id }).populate('user', 'name avatar email phone').lean();

  const formattedLeads = [];

  // Format New Leads
  newLeads.forEach(l => {
    formattedLeads.push({
      id: l._id.toString(),
      customer: l.user?.name || 'Unknown',
      type: l.serviceType?.name || 'Service',
      date: l.eventDate ? l.eventDate.toISOString().split('T')[0] : 'TBD',
      location: l.city || 'Unknown',
      budget: `₹${l.budget?.toLocaleString() || 0}`,
      status: 'new',
      requestedAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recently',
      notes: l.description || 'New inquiry',
      customerDetails: l.user,
      leadType: 'marketplace'
    });
  });

  // Format Quoted Leads
  leads.forEach(l => {
    const myQuote = l.quotations.find(q => q.vendor.toString() === vendor._id.toString());
    let uiStatus = 'contacted';

    // In our UI: new, contacted, negotiation, won, lost
    if (myQuote.status === 'accepted') uiStatus = 'won';
    else if (myQuote.status === 'rejected') uiStatus = 'lost';
    else if (l.status === 'assigned' && myQuote.status !== 'accepted') uiStatus = 'lost';
    else uiStatus = 'negotiation';

    formattedLeads.push({
      id: l._id.toString(),
      customer: l.user?.name || 'Unknown',
      type: l.serviceType?.name || 'Service',
      date: l.eventDate ? l.eventDate.toISOString().split('T')[0] : 'TBD',
      location: l.city || 'Unknown',
      budget: `₹${l.budget?.toLocaleString() || 0}`,
      status: uiStatus,
      requestedAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recently',
      notes: l.description || 'Negotiation ongoing',
      myQuote: myQuote,
      customerDetails: l.user,
      leadType: 'marketplace'
    });
  });

  // Format Bookings as leads
  bookings.forEach(b => {
    let uiStatus = 'contacted';
    if (b.status === 'pending') uiStatus = 'negotiation';
    else if (['confirmed', 'in_progress', 'completed'].includes(b.status)) uiStatus = 'won';
    else if (['cancelled', 'rejected'].includes(b.status)) uiStatus = 'lost';

    formattedLeads.push({
      id: (b._id || b.bookingId).toString(),
      customer: b.contactName || b.userId?.name || 'Unknown',
      type: b.serviceName || (b.bookingType === 'cab' ? 'Cab Booking' : 'Service Booking'),
      date: b.eventDate ? new Date(b.eventDate).toISOString().split('T')[0] : 'TBD',
      location: b.eventCity || b.eventVenue || 'Direct Booking',
      budget: `₹${b.totalPrice?.toLocaleString() || b.amount?.toLocaleString() || 0}`,
      status: uiStatus,
      requestedAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recently',
      notes: b.specialRequirements || b.specialRequests || 'Direct booking request.',
      customerDetails: b.userId,
      leadType: 'direct_booking'
    });
  });

  // Format Direct WhatsApp Leads
  directLeads.forEach(l => {
    formattedLeads.push({
      id: l._id.toString(),
      customer: l.customerName || l.user?.name || 'Unknown',
      type: l.serviceRequired || 'Direct Enquiry',
      date: l.weddingDate ? new Date(l.weddingDate).toISOString().split('T')[0] : 'TBD',
      location: l.city || 'TBD',
      budget: l.budget > 0 ? `₹${l.budget.toLocaleString()}` : 'TBD',
      status: l.status || 'new', // new, contacted, negotiation, won, lost
      requestedAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recently',
      notes: 'Direct WhatsApp Enquiry',
      customerDetails: l.user,
      leadType: 'whatsapp_lead'
    });
  });

  res.status(200).json({
    status: 'success',
    data: { leads: formattedLeads }
  });
});

// @desc    Update lead pipeline status
// @route   PATCH /api/vendors/leads/:id/status
// @access  Private (vendor)
const updateLeadPipelineStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body; // new, contacted, negotiation, won, lost
  const { Lead, Booking } = require('../models/index');
  const vendor = await Vendor.findOne({ user: req.user._id });

  if (!vendor) return next(new AppError('Vendor not found', 404));

  // Try to find if it's a Booking
  let booking = await Booking.findById(req.params.id);
  if (booking) {
    // Only allow updating certain statuses for bookings through CRM
    if (status === 'won') booking.status = 'confirmed';
    else if (status === 'lost') booking.status = 'cancelled';
    await booking.save();
    return res.status(200).json({ status: 'success', message: 'Booking status updated' });
  }

  // Try to find if it's a Direct Vendor Lead
  const VendorLead = require('../models/VendorLead');
  let vendorLead = await VendorLead.findById(req.params.id);
  if (vendorLead) {
    vendorLead.status = status;
    await vendorLead.save();
    return res.status(200).json({ status: 'success', message: 'Direct Lead status updated' });
  }

  // Fallback to Marketplace Lead
  let lead = await Lead.findById(req.params.id);
  if (lead) {
    let quote = lead.quotations.find(q => q.vendor.toString() === vendor._id.toString());
    if (!quote && ['contacted', 'negotiation', 'won'].includes(status)) {
      lead.quotations.push({
        vendor: vendor._id,
        amount: lead.budget || 0,
        message: 'Vendor initiated contact',
        status: status === 'won' ? 'accepted' : 'pending'
      });
    } else if (quote) {
      if (status === 'won') quote.status = 'accepted';
      else if (status === 'lost') quote.status = 'rejected';
      else quote.status = 'pending';
    }
    await lead.save();
    return res.status(200).json({ status: 'success', message: 'Lead status updated' });
  }

  return next(new AppError('Lead not found', 404));
});
// @desc    Get secure vendor contact (WhatsApp)
// @route   GET /api/vendors/:id/contact
// @access  Private
const getVendorContact = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  // Record the analytic event
  const ContactAnalytic = require('../models/ContactAnalytic');
  await ContactAnalytic.create({
    user: req.user._id,
    vendor: vendor._id,
    contactType: 'whatsapp'
  });

  // Create the Lead
  const VendorLead = require('../models/VendorLead');
  const User = require('../models/User');
  const user = await User.findById(req.user._id);

  const lead = await VendorLead.create({
    user: user._id,
    vendor: vendor._id,
    customerName: user.name,
    customerPhone: user.phone || 'N/A',
    customerEmail: user.email,
    weddingDate: user.weddingDate || null,
    city: user.city || 'TBD',
    guestCount: 0,
    budget: 0,
    serviceRequired: vendor.category?.name || 'Wedding Service',
    enquirySource: 'WhatsApp',
    status: 'new'
  });

  // Generate dynamic message
  const msg = `🎉 New Wedding Enquiry from ShaadiSaathi

Customer Details:
Name: ${lead.customerName}
Phone: ${lead.customerPhone}
Email: ${lead.customerEmail}

Wedding Details:
Wedding Date: ${lead.weddingDate ? new Date(lead.weddingDate).toLocaleDateString() : 'TBD'}
Location: ${lead.city}
Guest Count: TBD
Budget: TBD

Interested Service:
${lead.serviceRequired}

Vendor:
${vendor.businessName || 'ShaadiSaathi Partner'}

Lead ID:
${lead._id}

Please contact the customer regarding their wedding requirements.

Source:
ShaadiSaathi`;

  res.status(200).json({
    success: true,
    whatsappNumber: vendor.whatsappNumber || vendor.phone,
    encodedMessage: encodeURIComponent(msg)
  });
});

module.exports = {
  createVendorProfile, getMyVendorProfile, updateVendorProfile,
  uploadVendorImages, deleteVendorImage, uploadVendorCoverImage, getAllVendors, getVendorById,
  updateVendorApproval, getVendorDashboard, updateAvailability, getFeaturedVendors,
  activateSubscription, getVendorLeadsPipeline, updateLeadPipelineStatus, getVendorContact
};
