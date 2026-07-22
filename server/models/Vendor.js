const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  features: [String],
  isPopular: { type: Boolean, default: false },
});

const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const socialLinksSchema = new mongoose.Schema({
  instagram: String,
  facebook: String,
  youtube: String,
  website: String,
});

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  vendorType: {
    type: String,
    enum: ['service', 'cab'],
    required: true,
    default: 'service'
  },
  businessName: {
    type: String,
    required: function () { return this.profileCompletion > 0; },
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function () { return this.profileCompletion > 0; },
  },
  description: {
    type: String,
    required: function () { return this.profileCompletion > 0; },
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  tagline: { type: String, maxlength: 200 },
  images: [{
    url: { type: String, required: true },
    publicId: String,
    caption: String,
    isPrimary: { type: Boolean, default: false },
  }],
  coverImage: {
    url: String,
    publicId: String,
  },
  packages: [packageSchema],
  basePrice: { type: Number, min: 0 },
  price: { type: Number, min: 0 }, // Flat price field
  maxPrice: { type: Number, min: 0 },

  location: {
    city: { type: String, required: function () { return this.profileCompletion > 0; } },
    state: String,
    address: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  serviceAreas: [String], // Cities they serve
  phone: { type: String, required: function () { return this.profileCompletion > 0; } },
  alternatePhone: String,
  whatsappNumber: String,
  email: { type: String, required: function () { return this.profileCompletion > 0; } },
  socialLinks: socialLinksSchema,
  yearsOfExperience: { type: Number, min: 0 },
  teamSize: Number,
  specializations: [String],
  languages: [String],
  availability: [availabilitySchema],
  availabilityStatus: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
  },
  unavailableDates: [{ type: Date }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  totalBookings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  approvalNote: String,
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  verificationDocuments: [{
    type: { type: String },
    url: String,
    publicId: String,
    verified: { type: Boolean, default: false },
  }],
  badges: [{ type: String, enum: ['verified', 'topRated', 'quickResponder', 'experienced'] }],
  responseTime: { type: String, default: 'Within 24 hours' },
  cancellationPolicy: String,
  gstNumber: String,
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },
  views: { type: Number, default: 0 },
  enquiries: { type: Number, default: 0 },
  profileCompletion: { type: Number, default: 0 },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'elite', 'silver', 'gold', 'platinum'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'none'],
      default: 'none'
    },
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
    paymentId: String,
    autoRenew: { type: Boolean, default: false }
  },
  featuredUntil: Date,
  leadPriority: { type: Number, default: 0 },
  cabPricing: [{
    vehicleType: {
      type: String,
      enum: ['sedan', 'suv', 'luxury_car', 'vintage_car', 'bus', 'tempo_traveller'],
      required: true
    },
    baseFare: { type: Number, required: true },
    includedKm: { type: Number, default: 40 },
    pricePerKm: { type: Number, required: true },
    decorationCharge: { type: Number, default: 0 },
    waitingCharge: { type: Number, default: 0 }, // per hour
    nightCharge: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }],
}, { timestamps: true });

// Performance Indexes
vendorSchema.index({ email: 1 });
vendorSchema.index({ approvalStatus: 1 });
vendorSchema.index({ category: 1 });
vendorSchema.index({ 'location.city': 1 });
vendorSchema.index({ 'rating.average': -1 });
vendorSchema.index({ createdAt: -1 });
vendorSchema.index({ basePrice: 1 });
vendorSchema.index({ isFeatured: 1 });
vendorSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
vendorSchema.index({ totalBookings: -1 });
vendorSchema.index({ views: -1 });
vendorSchema.index({ businessName: 'text', description: 'text', tagline: 'text' });

vendorSchema.pre('save', function (next) {
  if (this.basePrice !== undefined) {
    this.price = this.basePrice;
  }

  if (this.subscription) {
    if (this.subscription.status === 'active') {
      this.subscription.isActive = true;
    } else {
      this.subscription.isActive = false;
    }
    if (this.subscription.endDate) {
      this.subscription.expiryDate = this.subscription.endDate;
    } else if (this.subscription.expiryDate) {
      this.subscription.endDate = this.subscription.expiryDate;
    }
  }
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
