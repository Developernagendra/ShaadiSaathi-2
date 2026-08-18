const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { getCategories, createCategory, updateCategory, deleteCategory, getCategoryBySlug, getCategoriesWithCounts } = require('../controllers/categoryController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

router.get('/', cacheMiddleware(3600), getCategories); // Cache categories for 1 hour
router.get('/with-counts', cacheMiddleware(300), getCategoriesWithCounts);
router.get('/slug/:slug', cacheMiddleware(3600), getCategoryBySlug);
router.post('/', protect, restrictTo('admin'), createCategory);
router.put('/:id', protect, restrictTo('admin'), updateCategory);
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);

module.exports = router;
