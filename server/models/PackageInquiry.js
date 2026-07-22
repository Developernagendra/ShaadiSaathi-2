const mongoose = require('mongoose');

const packageInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  weddingDate: {
    type: Date,
    required: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  guestsCount: {
    type: Number,
  },
  package: {
    type: String,
    enum: ['silver', 'gold', 'royal', 'custom'],
    required: true,
  },
  specialRequirements: {
    type: String,
    trim: true,
  },
  budget: {
    type: Number,
  },
  message: {
    type: String,
    trim: true,
  },
  assignedVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Negotiation', 'Converted', 'Rejected', 'Closed'],
    default: 'New',
  },
  notes: [{
    text: String,
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const PackageInquiry = mongoose.model('PackageInquiry', packageInquirySchema);

module.exports = PackageInquiry;
