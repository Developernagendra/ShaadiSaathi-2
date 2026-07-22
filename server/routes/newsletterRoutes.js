const express = require('express');
const router = express.Router();
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber,
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendTestEmail,
  sendCampaignNow
} = require('../controllers/newsletterController');

// Public routes
router.post('/subscribe', subscribe);
router.get('/unsubscribe', unsubscribe);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

// Subscriber routes
router.route('/subscribers')
  .get(getSubscribers);

router.route('/subscribers/:id')
  .delete(deleteSubscriber);

// Campaign routes
router.route('/campaigns')
  .get(getCampaigns)
  .post(createCampaign);

router.route('/campaigns/:id')
  .get(getCampaign)
  .patch(updateCampaign)
  .delete(deleteCampaign);

router.post('/campaigns/:id/test', sendTestEmail);
router.post('/campaigns/:id/send', sendCampaignNow);

module.exports = router;
