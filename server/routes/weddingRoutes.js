const express = require('express');
const router = require('express').Router();
const weddingController = require('../controllers/weddingController');
const { protect } = require('../middleware/authMiddleware');

// All wedding routes require authentication
router.use(protect);

// ==========================================
// CORE WEDDING PLAN
// ==========================================
router
  .route('/')
  .post(weddingController.createWeddingPlan);

router
  .route('/my')
  .get(weddingController.getMyWeddingPlan);

router
  .route('/:id')
  .put(weddingController.updateWeddingPlan);

// ==========================================
// EVENTS / TIMELINE
// ==========================================
router
  .route('/:id/events')
  .post(weddingController.createEvent);

router
  .route('/:id/events/:eventId')
  .put(weddingController.updateEvent)
  .delete(weddingController.deleteEvent);

// ==========================================
// GUESTS
// ==========================================
router
  .route('/:id/guests')
  .post(weddingController.addGuest);

router
  .route('/:id/guests/:guestId')
  .put(weddingController.updateGuest)
  .delete(weddingController.deleteGuest);

// ==========================================
// BUDGET
// ==========================================
router
  .route('/:id/budget')
  .post(weddingController.addBudgetCategory);

router
  .route('/:id/budget/:categoryId')
  .put(weddingController.updateBudgetCategory)
  .delete(weddingController.deleteBudgetCategory);

// ==========================================
// CHECKLIST
// ==========================================
router
  .route('/:id/checklist')
  .put(weddingController.updateChecklist);

// ==========================================
// RECOMMENDATIONS
// ==========================================
router
  .route('/:id/recommendations')
  .get(weddingController.getRecommendations);

module.exports = router;
