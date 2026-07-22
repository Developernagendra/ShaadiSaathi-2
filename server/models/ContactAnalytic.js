const mongoose = require('mongoose');

const contactAnalyticSchema = new mongoose.Schema({
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
  contactType: {
    type: String,
    enum: ['whatsapp', 'call', 'email'],
    default: 'whatsapp',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

contactAnalyticSchema.index({ user: 1, vendor: 1 });
contactAnalyticSchema.index({ vendor: 1, contactType: 1 });

module.exports = mongoose.model('ContactAnalytic', contactAnalyticSchema);
