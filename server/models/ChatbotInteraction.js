const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  uiPayload: { type: mongoose.Schema.Types.Mixed, default: null },
  timestamp: { type: Date, default: Date.now },
});

const chatbotInteractionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    messages: [messageSchema],
    metadata: {
      lastIntent: String,
      sourcePage: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatbotInteraction', chatbotInteractionSchema);
