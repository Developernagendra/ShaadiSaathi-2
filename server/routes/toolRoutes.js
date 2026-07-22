const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');

// Public or semi-public Tools API
router.post('/track', toolController.trackAction);
router.post('/predict-cost', toolController.predictCost);
router.post('/baraat-calc', toolController.baraatCalculator);
router.get('/vendor-availability', toolController.vendorAvailability);
router.get('/vendor-compare', toolController.compareVendors);

// Admin Analytics API
router.get('/analytics', protect, restrictTo('admin'), toolController.getAnalytics);

// ==================== PROTECTED STATEFUL ROUTES ====================
// These endpoints require authentication as they save user-specific state.

// Cost Predictor
router.post('/predict-cost/save', protect, userOnly, toolController.saveCostPrediction);
router.get('/predict-cost/history', protect, userOnly, toolController.getCostPredictions);

// Baraat Booking
router.post('/baraat-calc/book', protect, userOnly, toolController.createBaraatBooking);
router.get('/baraat-calc/bookings', protect, userOnly, toolController.getBaraatBookings);

// Budget Planner
router.post('/budget', protect, userOnly, toolController.saveBudgetPlan);
router.get('/budget', protect, userOnly, toolController.getBudgetPlan);

// Wedding Plan (AI Planner)
router.post('/ai-planner', protect, userOnly, toolController.saveWeddingPlan);
router.get('/ai-planner', protect, userOnly, toolController.getWeddingPlans);
router.delete('/ai-planner/:id', protect, userOnly, toolController.deleteWeddingPlan);

// Kundli Matching
router.post('/kundli', toolController.calculateKundli);
router.post('/kundli/save', protect, userOnly, toolController.saveKundli);
router.get('/kundli/saved', protect, userOnly, toolController.getSavedKundlis);
router.delete('/kundli/saved/:id', protect, userOnly, toolController.deleteSavedKundli);

// Shubh Muhurat Finder
router.post('/muhurat', toolController.calculateMuhurat);
router.post('/muhurat/save', protect, userOnly, toolController.saveMuhurat);
router.get('/muhurat/saved', protect, userOnly, toolController.getSavedMuhurats);
router.delete('/muhurat/saved/:id', protect, userOnly, toolController.deleteSavedMuhurat);

module.exports = router;
