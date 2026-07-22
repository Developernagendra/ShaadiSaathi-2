const mongoose = require('mongoose');

const newsletterCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  bannerUrl: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Campaign content is required']
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'partial_success'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  stats: {
    totalSent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 }
  },
  testEmailSentTo: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

newsletterCampaignSchema.index({ status: 1 });
newsletterCampaignSchema.index({ scheduledAt: 1 });
newsletterCampaignSchema.index({ createdAt: -1 });

const NewsletterCampaign = mongoose.model('NewsletterCampaign', newsletterCampaignSchema);

module.exports = NewsletterCampaign;
