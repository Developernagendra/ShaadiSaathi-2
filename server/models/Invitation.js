const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brideName: {
    type: String,
    trim: true,
    default: ''
  },
  groomName: {
    type: String,
    trim: true,
    default: ''
  },
  weddingDate: {
    type: String,
    default: ''
  },
  weddingTime: {
    type: String,
    default: ''
  },
  venue: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  googleMapLink: {
    type: String,
    default: ''
  },
  customMessage: {
    type: String,
    default: ''
  },
  ourStory: {
    type: String,
    default: ''
  },
  template: {
    type: String,
    default: 't1' // default template id
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  invitationLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  analytics: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    rsvpCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invitation', invitationSchema);
