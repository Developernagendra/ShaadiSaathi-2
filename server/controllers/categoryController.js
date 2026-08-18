const { Category } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = catchAsync(async (req, res, next) => {
  let categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });

  if (categories.length === 0) {
    const defaultCategories = [
      { name: 'Photography', icon: '📷', slug: 'photography', order: 1, isActive: true },
      { name: 'Catering', icon: '🍽️', slug: 'catering', order: 2, isActive: true },
      { name: 'Decoration', icon: '✨', slug: 'decoration', order: 3, isActive: true },
      { name: 'Mehndi', icon: '🌿', slug: 'mehndi', order: 4, isActive: true },
      { name: 'Venue', icon: '🏛️', slug: 'venue', order: 5, isActive: true },
      { name: 'DJ', icon: '🎵', slug: 'dj', order: 6, isActive: true },
      { name: 'Makeup Artist', icon: '💄', slug: 'makeup-artist', order: 7, isActive: true },
      { name: 'Tent House', icon: '🎪', slug: 'tent-house', order: 8, isActive: true },
      { name: 'Pandit', icon: '🪔', slug: 'pandit', order: 9, isActive: true },
      { name: 'Cab Service', icon: '🚗', slug: 'cab-service', order: 10, isActive: true }
    ];
    
    // Check if we just need to activate existing ones or insert new ones
    const totalCount = await Category.countDocuments();
    if (totalCount === 0) {
      await Category.create(defaultCategories);
    } else {
      await Category.updateMany({}, { isActive: true });
    }
    
    categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
  }

  res.status(200).json({
    success: true,
    status: 'success',
    categories
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Category created.',
    category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return next(new AppError('Category not found.', 404));
  res.status(200).json({
    status: 'success',
    message: 'Category updated.',
    category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new AppError('Category not found.', 404));
  res.status(200).json({
    status: 'success',
    message: 'Category deleted.'
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return next(new AppError('Category not found.', 404));
  
  // Get live vendor count
  const Vendor = require('../models/Vendor');
  const vendorCount = await Vendor.countDocuments({
    category: category._id,
    approvalStatus: 'approved',
    isActive: true
  });
  
  const categoryObj = category.toObject();
  categoryObj.vendorCount = vendorCount;
  
  res.status(200).json({
    success: true,
    status: 'success',
    category: categoryObj
  });
});

// @desc    Get categories with vendor counts
// @route   GET /api/categories/with-counts
// @access  Public
exports.getCategoriesWithCounts = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
  
  const Vendor = require('../models/Vendor');
  const counts = await Vendor.aggregate([
    { $match: { approvalStatus: 'approved', isActive: true, category: { $ne: null } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const countMap = {};
  counts.forEach(c => {
    countMap[c._id.toString()] = c.count;
  });
  
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    vendorCount: countMap[cat._id.toString()] || 0
  }));
  
  res.status(200).json({
    success: true,
    status: 'success',
    categories: categoriesWithCounts
  });
});
