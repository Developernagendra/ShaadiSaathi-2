const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyOrder } = require('../controllers/paymentController');

router.post('/create-order', protect, createOrder);
router.post('/verify-order', protect, verifyOrder);

module.exports = router;
