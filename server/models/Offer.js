const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    // Optional: if not provided, implies store-wide
  },
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'Offer description is required'],
    maxlength: 1000
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'upcoming', 'expired', 'paused', 'draft'],
    default: 'upcoming'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: 0 // 0 implies unlimited
  },
  bannerImage: {
    url: String,
    publicId: String
  },
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    bookingsGenerated: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Auto-update status based on dates on document save/find
offerSchema.pre('save', function(next) {
  const now = new Date();
  if (this.status !== 'paused' && this.status !== 'draft') {
    if (this.endDate < now) {
      this.status = 'expired';
    } else if (this.startDate > now) {
      this.status = 'upcoming';
    } else {
      this.status = 'active';
    }
  }
  
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    return next(new Error('Percentage discount cannot exceed 100'));
  }
  next();
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
