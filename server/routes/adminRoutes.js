const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');

// All admin routes are protected and restricted to admin role

const { 
  getAdminStats, 
  getAllBookingsAdmin, 
  updateVendorStatus, 
  getAllVendorsAdmin,
  getAllLeadsAdmin,
  getAllBlogsAdmin,
  saveBlog,
  deleteBlog,
  uploadAdminFile,
  getAllReviews,
  getPendingServicesAdmin,
  updateServiceStatusAdmin,
  approveServiceAdmin,
  rejectServiceAdmin,
  getAllServicesAdmin,
  getConfigAdmin,
  updateConfigAdmin,
  getBookingByIdAdmin,
  getSubscriptionsAdmin,
  updateVendorSubscriptionAdmin,
  getAvailabilityMonitor,
  getAllTestimonialsAdmin,
  saveTestimonial,
  deleteTestimonial
} = require('../controllers/adminController');
const multer = require('multer');

// Configure Multer memory storage with file size and type filters
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Strict 5MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP image files are allowed.'), false);
    }
  }
}).single('file');

// Custom middleware wrapper to catch and format Multer validation and size errors cleanly
const uploadSecureImage = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err) {
      console.error('Multer file upload validation failure:', err.message);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'fail',
            message: 'Upload too large. Maximum file size allowed is 5MB.'
          });
        }
        return res.status(400).json({ status: 'fail', message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ status: 'fail', message: err.message });
    }
    next();
  });
};

// All admin routes are protected and restricted to admin role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllBookingsAdmin);
router.get('/bookings/:id', getBookingByIdAdmin);
router.get('/vendors', getAllVendorsAdmin);
router.patch('/vendors/:id/status', updateVendorStatus);
router.get('/availability-monitor', getAvailabilityMonitor);
router.get('/subscriptions', getSubscriptionsAdmin);
router.patch('/vendors/:id/subscription', updateVendorSubscriptionAdmin);

router.get('/services', getAllServicesAdmin);
router.get('/services/pending', getPendingServicesAdmin);
router.patch('/services/:id/status', updateServiceStatusAdmin);
router.patch('/services/:id/approve', approveServiceAdmin);
router.patch('/services/:id/reject', rejectServiceAdmin);

router.get('/leads', getAllLeadsAdmin);
router.get('/blogs', getAllBlogsAdmin);
router.post('/blogs', saveBlog);
router.delete('/blogs/:id', deleteBlog);
router.post('/upload', uploadSecureImage, uploadAdminFile);

router.get('/reviews', getAllReviews);

router.get('/testimonials', getAllTestimonialsAdmin);
router.post('/testimonials', saveTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

router.route('/config')
  .get(getConfigAdmin)
  .patch(updateConfigAdmin);

const adminAstrologyController = require('../controllers/adminAstrologyController');
router.get('/astrology', adminAstrologyController.getAstrologyAnalytics);

module.exports = router;
