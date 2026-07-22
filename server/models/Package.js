const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  // Core Info
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  category: { type: String, required: true, trim: true, default: 'Wedding' },
  
  // Descriptions
  shortDescription: { type: String, required: true },
  longDescription: { type: String },
  
  // Media
  coverImage: { type: String },
  galleryImages: [{ type: String }],
  
  // Lists
  features: [{ type: String }],
  includedServices: [{ type: String }],
  excludedServices: [{ type: String }],
  tags: [{ type: String }],
  
  // Pricing
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number, required: true, min: 0 },
  
  // Configuration
  duration: { type: String }, // e.g., '1 Day', '3 Days'
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'published' 
  },
  visibility: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },

  // Preserved for backwards compatibility with UI temporarily
  badge: { type: String, trim: true },
  guests: { type: String, default: '100-200 Guests' },
  events: { type: String, default: '1 Event' },
  icon: { type: String, default: '💍' },
  ctaText: { type: String, default: 'Get Quote' },
  isPopular: { type: Boolean, default: false },

  // Tracking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null }

}, { timestamps: true });

// Pre-save hook to calculate finalPrice if not provided or if price/discount changes
packageSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discount')) {
    const discountAmount = (this.price * (this.discount || 0)) / 100;
    this.finalPrice = Math.round(this.price - discountAmount);
  }
  next();
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
