const express = require('express');
const router = express.Router();
const expertConsultationController = require('../controllers/expertConsultationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public route to submit an expert consultation
router.post('/', expertConsultationController.submitConsultation);

// Admin-only routes
router.use(protect);
router.use(restrictTo('admin'));

router
  .route('/')
  .get(expertConsultationController.getConsultations);

router
  .route('/:id')
  .put(expertConsultationController.updateConsultation)
  .delete(expertConsultationController.deleteConsultation);

module.exports = router;
