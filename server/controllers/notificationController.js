const { Notification } = require('../models/index');
const catchAsync = require('../utils/catchAsync');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  
  res.status(200).json({
    status: 'success',
    notifications,
    unreadCount
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markNotificationsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: Date.now() }
  );
  
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read.'
  });
});

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: Date.now() },
    { new: true }
  );
  
  if (!notification) return res.status(404).json({ status: 'fail', message: 'Notification not found' });

  res.status(200).json({ status: 'success', notification });
});
