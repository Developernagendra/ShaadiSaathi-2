const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: String,
  icon: String, // emoji or icon class
  image: {
    url: String,
    publicId: String,
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  vendorCount: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.index({ isActive: 1, order: 1 });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

// ==================== SERVICE MODEL ====================
const serviceSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: 200,
  },
  description: { type: String, required: true, maxlength: 3000 },
  images: [{ url: String, publicId: String, caption: String }],
  coverImage: { type: String },
  videos: [{ url: String, publicId: String, caption: String }],
  thumbnail: { type: String },
  featuredImage: { type: String },
  gallery: [{ type: String }],
  duration: { type: String }, // e.g. "Full Day", "4 Hours"
  features: [String], // General highlights
  packages: [{
    name: String,
    description: String,
    price: Number,
    features: [String],
    isPopular: Boolean,
  }],
  startingPrice: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, default: 0 }, // Flat price field as requested
  advancePercentage: { type: Number, required: true, default: 50 },

  city: { type: String, required: true },

  tags: [String],
  isActive: { type: Boolean, default: false },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  views: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, { timestamps: true });

serviceSchema.index({ vendor: 1 });
serviceSchema.index({ city: 1, category: 1, isActive: 1 });
serviceSchema.index({ startingPrice: 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ status: 1 });

serviceSchema.pre('validate', function (next) {
  // Sync images to gallery array of strings
  if (this.images && this.images.length > 0) {
    this.gallery = this.images.map(img => typeof img === 'string' ? img : (img.url || ''));
  } else if (this.gallery && this.gallery.length > 0) {
    this.images = this.gallery.map(url => ({ url }));
  }

  // Sync coverImage, thumbnail, featuredImage
  if (this.images && this.images.length > 0) {
    const firstUrl = typeof this.images[0] === 'string' ? this.images[0] : (this.images[0].url || '');
    if (!this.coverImage) this.coverImage = firstUrl;
    if (!this.thumbnail) this.thumbnail = firstUrl;
    if (!this.featuredImage) this.featuredImage = firstUrl;
  } else if (this.coverImage) {
    if (!this.thumbnail) this.thumbnail = this.coverImage;
    if (!this.featuredImage) this.featuredImage = this.coverImage;
  }

  if (this.startingPrice !== undefined) {
    this.price = this.startingPrice;
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);


// ==================== BOOKING MODEL ====================
const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  bookingType: {
    type: String,
    enum: ['service', 'cab', 'baraat-cab'],
    required: true
  },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  serviceName: { type: String, required: true },
  serviceCategory: { type: String },
  cab: { type: mongoose.Schema.Types.ObjectId, ref: 'Cab' },

  // Custom Baraat Fleet
  vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  fleetSelection: [{
    cabId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cab' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    count: { type: Number, default: 1 },
    pricePerVehicle: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    vehicleType: String,
    name: String
  }],
  packageSelected: {
    name: String,
    price: Number,
    features: [String],
  },
  eventDate: { type: Date, required: true },
  eventTime: String,
  eventVenue: String,
  eventCity: String,
  guestCount: Number,
  specialRequirements: String,
  specialRequests: String,
  dropLocation: String,
  packageType: String,
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: String,
  amount: { type: Number, required: true }, // Subtotal/Total Price
  totalPrice: { type: Number, required: true }, // Redundant but explicit as requested
  subtotal: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'on_the_way', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid', 'refunded', 'escrow'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    gateway: String,
    paidAmount: Number,
    paidAt: Date,
    escrowReleasedAt: Date,
  },
  // Cab specific fields
  pickupLocation: {
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  vehicles: [{
    vehicleType: String,
    count: Number,
    pricePerVehicle: Number,
    totalFare: Number
  }],
  cabIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cab' }],

  // Live Tracking Feature 4
  tripStatus: {
    type: String,
    enum: ['not_started', 'en_route_pickup', 'arrived', 'in_progress', 'completed'],
    default: 'not_started'
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  driverAssigned: {
    name: String,
    phone: String,
    vehicleNumber: String
  },

  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorNote: String,
  timeline: [{
    status: String,
    note: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  invoice: {
    url: String,
    generatedAt: Date,
  },
  isReviewed: { type: Boolean, default: false },
  selectedSlot: String,
  selectedSlotId: String,
}, { timestamps: true });

bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ vendorId: 1, status: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ vendor: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ cab: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ eventCity: 1 });

// Pre-save: sync redundant userId/user and vendorId/vendor fields
bookingSchema.pre('save', function (next) {
  if (this.userId && !this.user) this.user = this.userId;
  else if (this.user && !this.userId) this.userId = this.user;
  if (this.vendorId && !this.vendor) this.vendor = this.vendorId;
  else if (this.vendor && !this.vendorId) this.vendorId = this.vendor;
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);

// ==================== REVIEW MODEL ====================
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  cab: { type: mongoose.Schema.Types.ObjectId, ref: 'Cab' },
  bookingModel: { type: String, enum: ['Booking'], default: 'Booking' },
  booking: { type: mongoose.Schema.Types.ObjectId, refPath: 'bookingModel' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [{ url: String, publicId: String }],
  categories: {
    quality: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
  },
  vendorReply: {
    comment: String,
    repliedAt: Date,
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

reviewSchema.index({ vendor: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

const Review = mongoose.model('Review', reviewSchema);

// ==================== PAYMENT MODEL ====================
const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['stripe', 'upi', 'cash', 'bank_transfer'] },
  type: { type: String, enum: ['booking', 'cab_booking', 'subscription'], default: 'booking' },
  planName: { type: String },
  status: {
    type: String,
    enum: ['created', 'pending', 'captured', 'failed', 'refunded'],
    default: 'created',
  },
  transactionId: String,
  notes: String,
  refundAmount: Number,
  refundedAt: Date,
  refundReason: String,
}, { timestamps: true });

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ vendorId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

// ==================== CHAT MODEL ====================
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: Date,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.sentAt': -1 });

const Chat = mongoose.model('Chat', chatSchema);

// ==================== NOTIFICATION MODEL ====================
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['booking', 'review', 'chat', 'payment', 'system', 'vendor_approval', 'booking_status'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  link: { type: String, default: '/' },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

// Unified with Booking model

const cabSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // Reference to Vendor profile
  ownerType: {
    type: String,
    enum: ['admin', 'vendor'],
    default: 'vendor'
  },
  isAdminVehicle: { type: Boolean, default: false }, // Keep for backward compatibility/quick filter
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerRole: { type: String, enum: ['admin', 'vendor'], default: 'vendor' },
  name: { type: String, required: true },
  vehicleName: { type: String },
  category: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  isApproved: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  type: {
    type: String,
    enum: ['sedan', 'suv', 'luxury_car', 'vintage_car', 'bus', 'tempo_traveller', 'horse_carriage'],
    required: true
  },
  brand: String,
  model: String,
  modelYear: Number,
  color: String,
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'cng', 'electric']
  },
  ac: { type: Boolean, default: true },
  seatingCapacity: { type: Number, required: true },
  totalFleet: { type: Number, default: 1 },
  quantityAvailable: { type: Number, default: 1 }, // Deprecated alias
  vehicleNumber: { type: String, required: true, unique: true },
  registrationNumber: { type: String }, // Alias/Sync field
  description: String,

  images: [{
    url: String,
    publicId: String,
    viewType: {
      type: String,
      enum: ['front', 'back', 'side', 'interior', 'decorated']
    },
    isPrimary: { type: Boolean, default: false }
  }],
  vehicleImages: [{ type: String }],
  vehicleVideos: [{ type: String }],
  packageImages: [{ type: String }],

  // Documents (Secure Cloudinary URLs)
  documents: {
    registrationCertificate: {
      url: String,
      publicId: String
    },
    insuranceCertificate: {
      url: String,
      publicId: String
    },
    drivingLicense: {
      url: String,
      publicId: String
    },
    pollutionCertificate: {
      url: String,
      publicId: String
    },
    ownerIdProof: {
      url: String,
      publicId: String
    }
  },

  // Driver Assignment
  driverDetails: {
    name: String,
    phone: String,
    experienceYears: Number,
    uniformAvailable: { type: Boolean, default: true }
  },

  // Range and Availability
  availableDates: [{ type: String }],
  outstationAvailable: { type: Boolean, default: false },
  driverIncluded: { type: Boolean, default: true },

  // Additional Services (Premium Addons)
  additionalServices: {
    flowerDecoration: { type: Boolean, default: false },
    ribbonDecoration: { type: Boolean, default: false },
    groomEntrySetup: { type: Boolean, default: false },
    baraatSoundSupport: { type: Boolean, default: false }
  },

  // Premium Baraat Cab Packages (Single Vehicle Variants)
  packages: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    hours: { type: Number },
    kmLimit: { type: Number },
    description: String,
    features: [String],
    decorationIncluded: { type: Boolean, default: false },
    driverIncluded: { type: Boolean, default: true },
    fuelIncluded: { type: Boolean, default: true },
    extraKmCharge: Number,
    extraHourCharge: Number,
    isPopular: { type: Boolean, default: false }
  }],


  features: {
    driverIncluded: { type: Boolean, default: true },
    decorationAvailable: { type: Boolean, default: false },
    musicSystem: { type: Boolean, default: false },
    ac: { type: Boolean, default: true },
    fuelIncluded: { type: Boolean, default: true }
  },
  pricing: {
    baseFare: { type: Number, required: true },
    advancePercentage: { type: Number, required: true, default: 50 },
    pricePerDay: { type: Number },
    decorationCharges: { type: Number, default: 0 },
    extraKmCharges: { type: Number, default: 0 },
    driverCharges: { type: Number, default: 0 }
  },
  price: { type: Number, required: true }, // Flat price field

  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isAvailable: { type: Boolean, default: true },
  location: {
    city: { type: String, required: true, trim: true },
    state: { type: String, default: 'Bihar' }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'draft', 'changes_requested'],
    default: 'pending'
  },
  verificationChecklist: {
    documentsComplete: { type: Boolean, default: false },
    registrationVerified: { type: Boolean, default: false },
    insuranceValid: { type: Boolean, default: false },
    imagesVerified: { type: Boolean, default: false },
    pricingApproved: { type: Boolean, default: false }
  },
  adminRemarks: String,
  rejectionReason: String,
  internalNotes: String,
  isFeatured: { type: Boolean, default: false },
  auditLogs: [{
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminName: String,
    action: String,
    reason: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

cabSchema.index({ vendor: 1 });
cabSchema.index({ status: 1, isAvailable: 1 });
cabSchema.index({ 'location.city': 1 });
cabSchema.index({ 'pricing.baseFare': 1 });
cabSchema.index({ isFeatured: 1 });
cabSchema.index({ category: 1 });
cabSchema.index({ type: 1 });
cabSchema.index({ brand: 1 });
cabSchema.index({ 'rating.average': -1 });
cabSchema.index({ createdAt: -1 });

cabSchema.pre('validate', function (next) {
  // Sync cab vehicleImages, vehicleVideos and packageImages
  if (this.images && this.images.length > 0) {
    this.vehicleImages = this.images.map(img => typeof img === 'string' ? img : (img.url || ''));
  } else if (this.vehicleImages && this.vehicleImages.length > 0) {
    this.images = this.vehicleImages.map((url, idx) => ({
      url,
      viewType: idx === 0 ? 'front' : 'side',
      isPrimary: idx === 0
    }));
  }

  if (this.location && this.location.city) {
    this.location.city = this.location.city.trim().toLowerCase();
  }
  // Sync ownerType based on isAdminVehicle if not set
  if (this.isAdminVehicle) {
    this.ownerType = 'admin';
  }
  // Sync registrationNumber and vehicleNumber
  if (this.registrationNumber && !this.vehicleNumber) {
    this.vehicleNumber = this.registrationNumber;
  } else if (this.vehicleNumber && !this.registrationNumber) {
    this.registrationNumber = this.vehicleNumber;
  }

  // Sync vehicleName as display label
  if (!this.vehicleName && this.name) {
    this.vehicleName = this.name;
  } else if (!this.name && this.vehicleName) {
    this.name = this.vehicleName;
  } else if (!this.name && !this.vehicleName) {
    const brandName = this.brand || '';
    const modelName = this.model || '';
    const nameStr = `${brandName} ${modelName}`.trim() || 'Premium Vehicle';
    this.vehicleName = nameStr;
    this.name = nameStr;
  }

  // Sync vendorId with vendor
  if (this.vendor && !this.vendorId) {
    this.vendorId = this.vendor;
  } else if (this.vendorId && !this.vendor) {
    this.vendor = this.vendorId;
  }

  // Sync approval, active and published states
  this.isApproved = this.status === 'approved';
  this.isPublished = this.isAvailable !== false;
  this.isActive = this.isAvailable !== false;

  // Sync category with type
  if (this.type && !this.category) {
    this.category = this.type;
  } else if (this.category && !this.type) {
    this.type = this.category;
  }

  // Sync packages base price
  if (this.packages && this.packages.length > 0) {
    const minPackagePrice = Math.min(...this.packages.map(p => p.price || Infinity));
    if (minPackagePrice !== Infinity) {
      if (!this.pricing) this.pricing = {};
      this.pricing.baseFare = minPackagePrice;
      this.price = minPackagePrice;
    }
  } else {
    // Sync flat price with baseFare if no packages
    if (this.pricing && this.pricing.baseFare !== undefined && this.pricing.baseFare !== null) {
      this.price = this.pricing.baseFare;
    } else if (this.price !== undefined && this.price !== null) {
      if (!this.pricing) this.pricing = {};
      this.pricing.baseFare = this.price;
    }
  }

  // Sync totalFleet and quantityAvailable for backward compatibility
  if (this.totalFleet !== undefined && this.quantityAvailable === 1) {
    this.quantityAvailable = this.totalFleet;
  } else if (this.quantityAvailable !== undefined && this.totalFleet === 1) {
    this.totalFleet = this.quantityAvailable;
  }

  next();
});

cabSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update) {
    if (update.price !== undefined) {
      if (update.pricing) {
        update.pricing.baseFare = update.price;
      } else {
        update['pricing.baseFare'] = update.price;
      }
    } else if (update.pricing && update.pricing.baseFare !== undefined) {
      update.price = update.pricing.baseFare;
    } else if (update['pricing.baseFare'] !== undefined) {
      update.price = update['pricing.baseFare'];
    }
  }
  next();
});


const Cab = mongoose.model('Cab', cabSchema);

const systemConfigSchema = new mongoose.Schema({
  siteName: { type: String, default: 'ShaadiSaathi' },
  contactEmail: { type: String, default: 'admin@shaadisaathi.com' },
  maintenanceMode: { type: Boolean, default: false },
  enableRegistration: { type: Boolean, default: true },
  platformFee: { type: Number, default: 10 },
  minPayout: { type: Number, default: 1000 },
  showContactAfterBookingOnly: { type: Boolean, default: true }
}, { timestamps: true });

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

const User = require('./User');
const Vendor = require('./Vendor');
const Availability = require('./Availability');
const Offer = require('./Offer');
const { Lead, Guest, Checklist, Blog, Testimonial, HomeStats } = require('./FeatureModels');
const NewsletterSubscriber = require('./NewsletterSubscriber');
const NewsletterCampaign = require('./NewsletterCampaign');
const { RealWedding, Gallery } = require('./ShowcaseModels');

const Package = require('./Package');
const PackageInquiry = require('./PackageInquiry');
const ExpertConsultation = require('./ExpertConsultation');
const Invitation = require('./Invitation');

module.exports = {
  User,
  Vendor,
  Service,
  Category,
  Booking,
  Notification,
  Availability,
  Review,
  Payment,
  Lead,
  Guest,
  Checklist,
  Blog,
  Testimonial,
  HomeStats,
  Cab,
  Chat,
  SystemConfig,
  Offer,
  NewsletterSubscriber,
  NewsletterCampaign,
  Package,
  PackageInquiry,
  ExpertConsultation,
  Invitation,
  RealWedding,
  Gallery
};

