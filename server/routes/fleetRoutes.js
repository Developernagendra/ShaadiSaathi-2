const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { 
  createCab, 
  updateCab, 
  deleteCab, 
  getCabDetails,
  getAdminFleet,
  getVendorCabs,
  getCabs,
  moderateCab,
  uploadCabImage,
  getFeaturedCabs
} = require('../controllers/cabController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Public browsing
router.get('/browse', getCabs);
router.get('/featured', getFeaturedCabs);
router.get('/details/:id', getCabDetails);

// Protected Management
router.use(protect);

// @desc    Upload vehicle image
// @route   POST /api/fleet/upload
router.post('/upload', upload.single('file'), uploadCabImage);

// Role-based fleet access
router.get('/', (req, res, next) => {
  if (req.user.role === 'admin') return getAdminFleet(req, res, next);
  return getVendorCabs(req, res, next);
});

// @desc    Get vendor-specific fleet list
// @route   GET /api/fleet/vendor
router.get('/vendor', getVendorCabs);

// @desc    Get single vehicle details
// @route   GET /api/fleet/:id
router.get('/:id', getCabDetails);

// @desc    Add new vehicle to fleet
// @route   POST /api/fleet
router.post('/', restrictTo('admin', 'vendor'), createCab);

// @desc    Update vehicle in fleet
// @route   PATCH /api/fleet/:id
router.patch('/:id', restrictTo('admin', 'vendor'), updateCab);

// @desc    Delete vehicle from fleet
// @route   DELETE /api/fleet/:id
router.delete('/:id', restrictTo('admin', 'vendor'), deleteCab);

// Admin Moderation
router.patch('/moderate/:id', restrictTo('admin'), moderateCab);


module.exports = router;
