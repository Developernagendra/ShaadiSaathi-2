const { Package } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
exports.getPackages = catchAsync(async (req, res, next) => {
  // Advanced filtering
  const { search, category, status, visibility, sort } = req.query;
  
  let query = { deletedAt: null }; // Default: hide soft deleted

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) query.category = category;
  
  // Public users only see published and visible packages
  if (!req.user || req.user.role !== 'admin') {
    query.status = 'published';
    query.visibility = true;
  } else {
    // Admin can filter by status
    if (status) query.status = status;
    if (visibility !== undefined) query.visibility = visibility === 'true';
  }

  // Sorting
  let sortOption = { priority: -1, createdAt: 1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { finalPrice: 1 };
  if (sort === 'price_desc') sortOption = { finalPrice: -1 };

  const packages = await Package.find(query)
    .sort(sortOption)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
  
  res.status(200).json({
    success: true,
    count: packages.length,
    data: packages
  });
});

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
exports.getPackage = catchAsync(async (req, res, next) => {
  const pkg = await Package.findOne({ _id: req.params.id, deletedAt: null });
  
  if (!pkg) {
    return next(new AppError('No package found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    data: pkg
  });
});

// @desc    Create new package
// @route   POST /api/packages
// @access  Private/Admin
exports.createPackage = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  
  // Basic validation for unique slug
  if (req.body.slug) {
    const existing = await Package.findOne({ slug: req.body.slug });
    if (existing) return next(new AppError('Slug must be unique', 400));
  }

  const newPackage = await Package.create(req.body);
  
  res.status(201).json({
    success: true,
    data: newPackage
  });
});

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
exports.updatePackage = catchAsync(async (req, res, next) => {
  req.body.updatedBy = req.user.id;

  const pkg = await Package.findOne({ _id: req.params.id, deletedAt: null });
  
  if (!pkg) {
    return next(new AppError('No package found with that ID', 404));
  }

  // Prevent slug collision
  if (req.body.slug && req.body.slug !== pkg.slug) {
    const existing = await Package.findOne({ slug: req.body.slug });
    if (existing) return next(new AppError('Slug must be unique', 400));
  }

  // Update fields
  Object.assign(pkg, req.body);
  await pkg.save(); // using save to trigger the pre-save hook for finalPrice
  
  res.status(200).json({
    success: true,
    data: pkg
  });
});

// @desc    Delete package (Soft Delete)
// @route   DELETE /api/packages/:id
// @access  Private/Admin
exports.deletePackage = catchAsync(async (req, res, next) => {
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg || pkg.deletedAt !== null) {
    return next(new AppError('No package found with that ID', 404));
  }
  
  pkg.deletedAt = new Date();
  pkg.status = 'archived';
  await pkg.save();
  
  res.status(204).json({
    success: true,
    data: null
  });
});

// @desc    Auto seed packages on startup if empty
exports.seedPackagesIfEmpty = async () => {
  try {
    const count = await Package.countDocuments();
    if (count === 0) {
      console.log('⏳ Seeding initial Wedding Packages (New Schema)...');
      await Package.create([
        {
          name: 'Silver',
          slug: 'silver-wedding',
          category: 'Wedding',
          shortDescription: 'Perfect for intimate celebrations',
          price: 60000,
          discount: 0,
          finalPrice: 60000,
          guests: '80–120 Guests',
          events: '1 Event',
          features: [
            '📸 1 Cameraman',
            '🍽 Catering',
            '🚗 10 Baraat Cars'
          ],
          includedServices: ['Photography', 'Basic Decoration', 'Venue Sourcing'],
          excludedServices: ['Cinematography', 'Makeup Artist', 'Choreography'],
          icon: '🥉',
          priority: 1,
          status: 'published'
        },
        {
          name: 'Gold',
          slug: 'gold-wedding',
          category: 'Wedding',
          shortDescription: 'Perfect for premium weddings',
          price: 105000,
          discount: 10,
          finalPrice: 94500,
          guests: '150–250 Guests',
          events: '2 Events',
          badge: '⭐ Most Popular',
          features: [
            '📸 2 Cameras',
            '🍽 Premium Catering',
            '🚗 15 Cars'
          ],
          includedServices: ['Photography & Videography', 'Premium Decoration', 'DJ & Sound', 'Venue Sourcing'],
          excludedServices: ['Celebrity Performances', 'Luxury Transport'],
          icon: '🥈',
          priority: 2,
          isPopular: true,
          status: 'published'
        },
        {
          name: 'Premium',
          slug: 'premium-wedding',
          category: 'Wedding',
          shortDescription: 'Luxury Experience',
          price: 195000,
          discount: 0,
          finalPrice: 195000,
          guests: '250–400 Guests',
          events: '3–4 Events',
          badge: 'Luxury',
          features: [
            '📸 4K Shoot',
            '🍽 Luxury Catering',
            '🚗 20 Premium Cars'
          ],
          includedServices: ['4K Cinematography', 'Luxury Decor', 'Dedicated Event Manager', 'Full Coordination', 'Makeup Artist'],
          excludedServices: [],
          icon: '👑',
          priority: 3,
          status: 'published'
        }
      ]);
      console.log('✅ Initial Wedding Packages seeded successfully.');
    }
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
  }
};
