const mongoose = require('mongoose');

// ==================== WEDDING PLAN MODEL (Bihari Wedding Planner) ====================
const weddingPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: String, unique: true }, // e.g., WED-2026-XXXX
  brideName: { type: String },
  groomName: { type: String },
  weddingDate: { type: Date },
  city: { type: String },
  district: { type: String },
  state: { type: String, default: 'Bihar' },
  venue: { type: String },
  guestCount: { type: Number },
  budget: { type: Number },
  weddingStyle: { type: String },
  weddingType: { type: String, enum: ['Traditional Bihari', 'Mithila Wedding', 'Maithili Wedding', 'Bhojpuri Wedding', 'Magahi Wedding', 'Modern Indian Wedding', 'Destination Wedding', 'Custom'], default: 'Traditional Bihari' },
  region: { type: String, enum: ['Mithila', 'Bhojpur', 'Magadh', 'Champaran', 'Seemanchal', 'Kosi', 'Anga', 'Other'], default: 'Mithila' },
  roadmap: { type: mongoose.Schema.Types.Mixed }, // Legacy JSON output
  status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
}, { timestamps: true });

weddingPlanSchema.index({ user: 1, createdAt: -1 });
const WeddingPlan = mongoose.model('WeddingPlan', weddingPlanSchema);

// ==================== WEDDING EVENT MODEL (Timeline) ====================
const weddingEventSchema = new mongoose.Schema({
  weddingPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingPlan', required: true },
  title: { type: String, required: true }, // e.g. Tilak, Haldi
  date: { type: Date },
  description: { type: String },
  isCompleted: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

weddingEventSchema.index({ weddingPlan: 1, date: 1 });
const WeddingEvent = mongoose.model('WeddingEvent', weddingEventSchema);

// ==================== WEDDING BUDGET MODEL ====================
const weddingBudgetSchema = new mongoose.Schema({
  weddingPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingPlan', required: true },
  categories: [{
    name: { type: String, required: true }, // Venue, Catering, DJ
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
  }]
}, { timestamps: true });

weddingBudgetSchema.index({ weddingPlan: 1 });
const WeddingBudget = mongoose.model('WeddingBudget', weddingBudgetSchema);

// ==================== BUDGET PLAN MODEL (Budget Calculator) ====================
const budgetPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalBudget: { type: Number, required: true },
  allocations: { type: Map, of: Number }, // category -> amount
  customCategories: [{ name: String, amount: Number }],
}, { timestamps: true });

budgetPlanSchema.index({ user: 1 });
const BudgetPlan = mongoose.model('BudgetPlan', budgetPlanSchema);

// ==================== COST PREDICTION MODEL ====================
const costPredictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String },
  guestCount: { type: Number },
  weddingType: { type: String },
  services: [String],
  totalEstimatedCost: { type: Number },
  rangeLow: { type: Number },
  rangeHigh: { type: Number },
  breakdown: { type: Map, of: Number },
}, { timestamps: true });

costPredictionSchema.index({ user: 1 });
const CostPrediction = mongoose.model('CostPrediction', costPredictionSchema);

// ==================== SAVED KUNDLI REPORT ====================
const savedKundliSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brideName: { type: String },
  groomName: { type: String },
  totalScore: { type: Number },
  percentage: { type: Number },
  reportData: { type: mongoose.Schema.Types.Mixed }, // Full JSON from astrology engine
  language: { type: String, default: 'en' }
}, { timestamps: true });

savedKundliSchema.index({ user: 1 });
const SavedKundli = mongoose.model('SavedKundli', savedKundliSchema);

// ==================== SAVED MUHURAT SEARCH ====================
const savedMuhuratSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String },
  state: { type: String },
  year: { type: Number },
  month: { type: Number },
  muhurats: [{ type: mongoose.Schema.Types.Mixed }], // Array of dates from astrology engine
  language: { type: String, default: 'en' }
}, { timestamps: true });

savedMuhuratSchema.index({ user: 1 });
const SavedMuhurat = mongoose.model('SavedMuhurat', savedMuhuratSchema);

module.exports = {
  WeddingPlan,
  WeddingEvent,
  WeddingBudget,
  BudgetPlan,
  CostPrediction,
  SavedKundli,
  SavedMuhurat
};
