const express = require('express');
const aiController = require('../controllers/aiController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const aiPlannerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many wedding plans generated from this IP, please try again after 15 minutes' }
});

router.post('/wedding-planner', aiPlannerLimiter, aiController.generateWeddingPlan);
router.get('/health', aiController.getHealth);

module.exports = router;
