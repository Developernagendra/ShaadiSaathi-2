const mongoose = require('mongoose');

const toolAnalyticsSchema = new mongoose.Schema({
  toolName: { 
    type: String, 
    required: true,
    index: true 
  },
  action: { 
    type: String,
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  metadata: { 
    type: Object,
    default: {}
  },
  language: {
    type: String,
    default: 'en'
  },
  state: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Index for time-series aggregation
toolAnalyticsSchema.index({ createdAt: -1 });
toolAnalyticsSchema.index({ toolName: 1, action: 1 });

module.exports = mongoose.model('ToolAnalytics', toolAnalyticsSchema);
