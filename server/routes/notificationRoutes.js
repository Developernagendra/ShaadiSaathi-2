const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const { getNotifications, markNotificationsRead, markNotificationAsRead } = require('../controllers/notificationController');

router.use(protect);
router.get('/', getNotifications);
router.patch('/mark-read', markNotificationsRead);
router.patch('/:id/read', markNotificationAsRead);

module.exports = router;
