const mongoose = require('mongoose');

const expertConsultationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  package: {
    type: String,
    trim: true,
    default: null,
  },
  service: {
    type: String,
    trim: true,
    default: null,
  },
  weddingDate: {
    type: Date,
  },
  city: {
    type: String,
    trim: true,
  },
  guestCount: {
    type: Number,
  },
  preferredDate: {
    type: Date,
  },
  preferredTime: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  assignedExpert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: [{
    text: String,
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const ExpertConsultation = mongoose.model('ExpertConsultation', expertConsultationSchema);

module.exports = ExpertConsultation;
