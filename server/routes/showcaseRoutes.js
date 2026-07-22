const express = require('express');
const router = express.Router();
const { protect, restrictTo, optionalAuth } = require('../middleware/authMiddleware');
const {
  getApprovedRealWeddings,
  getRealWeddingById,
  getFeaturedRealWeddings,
  getVendorRealWeddings,
  createRealWedding,
  updateRealWedding,
  deleteRealWedding,
  getAllRealWeddingsAdmin,
  updateRealWeddingAdmin,
  deleteRealWeddingAdmin,

  getApprovedGallery,
  getFeaturedGallery,
  getVendorGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getAllGalleryAdmin,
  updateGalleryAdmin,
  deleteGalleryAdmin
} = require('../controllers/showcaseController');
const { uploadService } = require('../config/cloudinary');

// ============================================
// PUBLIC ROUTES
// ============================================

router.get('/real-weddings', getApprovedRealWeddings);
router.get('/real-weddings/featured', getFeaturedRealWeddings);
router.get('/real-weddings/:id', optionalAuth, getRealWeddingById);

router.get('/gallery', getApprovedGallery);
router.get('/gallery/featured', getFeaturedGallery);

// ============================================
// VENDOR ROUTES
// ============================================
router.use('/vendor', protect, restrictTo('vendor'));

router.route('/vendor/real-weddings')
  .get(getVendorRealWeddings)
  .post(uploadService.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 15 }]), createRealWedding);

router.route('/vendor/real-weddings/:id')
  .patch(uploadService.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 15 }]), updateRealWedding)
  .delete(deleteRealWedding);

router.route('/vendor/gallery')
  .get(getVendorGallery)
  .post(uploadService.fields([{ name: 'images', maxCount: 15 }, { name: 'videos', maxCount: 5 }]), createGalleryItem);

router.route('/vendor/gallery/:id')
  .patch(uploadService.fields([{ name: 'images', maxCount: 15 }, { name: 'videos', maxCount: 5 }]), updateGalleryItem)
  .delete(deleteGalleryItem);


// ============================================
// ADMIN ROUTES
// ============================================
router.use('/admin', protect, restrictTo('admin'));

router.route('/admin/real-weddings')
  .get(getAllRealWeddingsAdmin);

router.route('/admin/real-weddings/:id')
  .patch(updateRealWeddingAdmin)
  .delete(deleteRealWeddingAdmin);

router.route('/admin/gallery')
  .get(getAllGalleryAdmin);

router.route('/admin/gallery/:id')
  .patch(updateGalleryAdmin)
  .delete(deleteGalleryAdmin);

module.exports = router;
