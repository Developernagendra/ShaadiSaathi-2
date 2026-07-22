const mongoose = require('mongoose');

const vendorLeadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    default: 'N/A'
  },
  customerEmail: {
    type: String,
    required: true
  },
  weddingDate: {
    type: Date
  },
  city: {
    type: String,
    default: 'TBD'
  },
  guestCount: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  serviceRequired: {
    type: String,
    default: 'Wedding Service'
  },
  enquirySource: {
    type: String,
    enum: ['WhatsApp', 'Direct', 'Other'],
    default: 'WhatsApp'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'negotiation', 'won', 'lost'],
    default: 'new'
  }
}, { timestamps: true });

vendorLeadSchema.index({ vendor: 1, status: 1 });
vendorLeadSchema.index({ user: 1 });
vendorLeadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VendorLead', vendorLeadSchema);
