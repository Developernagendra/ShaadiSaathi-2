const express = require('express');
const router = express.Router();
const { 
  createInvitation, 
  getUserInvitations, 
  getInvitation, 
  updateInvitation, 
  deleteInvitation 
} = require('../controllers/invitationController');
const { protect, restrictTo, adminOnly, vendorOnly, userOnly, verified, optionalAuth, restrictToApproved } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createInvitation)
  .get(protect, getUserInvitations);

router.route('/:id')
  .get(getInvitation) // Public for preview/share
  .put(protect, updateInvitation)
  .delete(protect, deleteInvitation);

module.exports = router;
