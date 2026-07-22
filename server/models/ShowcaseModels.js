const mongoose = require('mongoose');

// ==================== REAL WEDDINGS MODEL ====================
const realWeddingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  brideName: { type: String, required: true },
  groomName: { type: String, required: true },
  city: { type: String, required: true },
  venue: { type: String, required: true },
  weddingDate: { type: Date, required: true },
  story: { type: String, required: true },
  budget: { type: String }, // e.g., "10-15 Lakhs"
  coverImage: { type: String, required: true },
  galleryImages: [{ type: String }],
  servicesUsed: [{ type: String }], // e.g., ["Photography", "Venue", "Catering"]
  vendorsUsed: [{ 
    vendorType: String,
    vendorName: String,
    vendorLink: String 
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

realWeddingSchema.index({ status: 1 });
realWeddingSchema.index({ featured: 1 });
realWeddingSchema.index({ vendorId: 1 });
realWeddingSchema.index({ city: 1 });

const RealWedding = mongoose.model('RealWedding', realWeddingSchema);

// ==================== GALLERY MODEL ====================
const gallerySchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: [
      'Photography', 'Decoration', 'Mehndi', 'Makeup', 'Venue', 
      'Catering', 'DJ', 'Luxury Baraat Cabs', 'Haldi', 'Sangeet', 
      'Reception', 'Other'
    ],
    required: true
  },
  tags: [{ type: String }],
  images: [{ type: String }],
  videos: [{ type: String }], // Array of video URLs
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

gallerySchema.index({ status: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ vendorId: 1 });
gallerySchema.index({ featured: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = { RealWedding, Gallery };
