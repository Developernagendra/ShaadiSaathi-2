const express = require('express');
const astrologyController = require('../controllers/astrologyController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/kundli/match', optionalAuth, astrologyController.matchKundli);
router.post('/muhurat/find', optionalAuth, astrologyController.findMuhurat);

router.get('/report/:id', optionalAuth, astrologyController.getReport);

// Protected routes below
router.use(protect);

router.get('/my-reports', astrologyController.getMyReports);

router.get('/admin/reports', adminOnly, astrologyController.getAllReportsAdmin);

module.exports = router;
