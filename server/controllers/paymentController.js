const Razorpay = require('razorpay');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Booking } = require('../models/index');

// Initialize Razorpay instance safely (avoid crashing if env vars are missing during dev setup)
let razorpayInstance = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.warn('⚠️  Failed to initialize Razorpay instance. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = catchAsync(async (req, res, next) => {
  const { amount, currency = 'INR', receipt = 'receipt_1' } = req.body;

  if (!amount) {
    return next(new AppError('Amount is required to create a payment order.', 400));
  }

  if (!razorpayInstance) {
    // In development mode without API keys, we can bypass actual gateway and return a mock order
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Mocking Razorpay Order since API keys are missing.');
      return res.status(200).json({
        success: true,
        order: {
          id: `order_mock_${Date.now()}`,
          amount: amount * 100,
          currency,
          receipt,
        }
      });
    }
    return next(new AppError('Payment gateway is not configured.', 500));
  }

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  };

  const order = await razorpayInstance.orders.create(options);

  if (!order) {
    return next(new AppError('Failed to create Razorpay order.', 500));
  }

  res.status(200).json({
    success: true,
    order
  });
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify-order
// @access  Private
exports.verifyOrder = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Dev bypass
  if (!razorpayInstance && process.env.NODE_ENV === 'development' && razorpay_order_id.startsWith('order_mock_')) {
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully (Mock Mode)',
      paymentId: `pay_mock_${Date.now()}`
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError('Missing payment verification details.', 400));
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Update booking payment status if a matching booking exists
    try {
      const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.razorpayPaymentId = razorpay_payment_id;
        booking.paidAt = new Date();
        await booking.save();
      }
    } catch (dbErr) {
      console.error('⚠️ Payment verified but failed to update booking:', dbErr.message);
      // Don't fail the response — payment was verified successfully
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id
    });
  } else {
    return next(new AppError('Payment signature verification failed. Possible tampering detected.', 400));
  }
});
