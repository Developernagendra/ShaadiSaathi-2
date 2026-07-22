const ToolAnalytics = require('../models/ToolAnalytics');
const Vendor = require('../models/Vendor');
const { WeddingPlan, BudgetPlan, CostPrediction, BaraatBookingRequest } = require('../models/ToolModels');
const { Lead } = require('../models/FeatureModels');
const catchAsync = require('../utils/catchAsync');

// Track tool usage
exports.trackAction = catchAsync(async (req, res) => {
  const { toolName, action, metadata } = req.body;
  
  if (!toolName || !action) {
    return res.status(400).json({ success: false, message: 'Tool name and action are required' });
  }

  await ToolAnalytics.create({
    toolName,
    action,
    user: req.user ? req.user._id : null,
    metadata
  });

  res.status(200).json({ success: true });
});

// Admin Dashboard Analytics
exports.getAnalytics = catchAsync(async (req, res) => {
  // Aggregate tool usage
  const mostUsedTools = await ToolAnalytics.aggregate([
    { $group: { _id: '$toolName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const recentActivity = await ToolAnalytics.find()
    .sort('-createdAt')
    .limit(50)
    .populate('user', 'name email');

  const totalInteractions = await ToolAnalytics.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      mostUsedTools,
      recentActivity,
      totalInteractions
    }
  });
});

// Wedding Cost Predictor Logic
exports.predictCost = catchAsync(async (req, res) => {
  const { guestCount, locationTier = 'tier-2', weddingType = 'traditional', services = [] } = req.body;
  
  // Base cost per guest based on city tier
  const tierMultipliers = { 'tier-1': 5000, 'tier-2': 3000, 'tier-3': 2000 };
  const basePerGuest = tierMultipliers[locationTier] || 3000;
  
  // Base cost multiplier based on wedding type
  const typeMultipliers = { 'luxury': 2.0, 'traditional': 1.0, 'intimate': 0.8, 'destination': 3.0 };
  const typeMult = typeMultipliers[weddingType] || 1.0;

  // Additional services multipliers
  const serviceCosts = {
    'venue': 0.25,
    'catering': 0.20,
    'photography': 0.15,
    'decoration': 0.15,
    'makeup': 0.08,
    'mehndi': 0.05,
    'dj': 0.05,
    'baraat-cabs': 0.07
  };

  let totalCost = guestCount * basePerGuest * typeMult;
  
  // If specific services are passed, we adjust the total to only sum those. 
  // If not, we assume full suite.
  if (services && services.length > 0) {
    let serviceMult = 0;
    services.forEach(s => {
      serviceMult += (serviceCosts[s.toLowerCase()] || 0);
    });
    // Add 10% buffer
    totalCost = totalCost * (serviceMult + 0.10);
  }

  const breakdownMap = {
    'Venue': 0.25,
    'Catering': 0.20,
    'Photography': 0.15,
    'Decoration': 0.15,
    'Makeup & Styling': 0.08,
    'Other Expenses': 0.17
  };
  
  const breakdownArr = Object.keys(breakdownMap).map(cat => ({
    category: cat,
    percentage: breakdownMap[cat] * 100,
    amount: Math.round(totalCost * breakdownMap[cat])
  }));

  // Ensure tool analytics is tracked
  await ToolAnalytics.create({
    toolName: 'Cost Predictor',
    action: 'predicted_cost',
    user: req.user ? req.user._id : null,
    metadata: { guestCount, locationTier, weddingType }
  });

  res.status(200).json({
    success: true,
    data: {
      total: Math.round(totalCost),
      estimatedCost: Math.round(totalCost),
      rangeLow: Math.round(totalCost * 0.8),
      rangeHigh: Math.round(totalCost * 1.2),
      breakdown: breakdownArr
    }
  });
});

// Baraat Calculator Logic
exports.baraatCalculator = catchAsync(async (req, res) => {
  const { guestCount } = req.body;
  
  if (!guestCount) return res.status(400).json({ success: false, message: 'Guest count required' });

  // Rough estimation:
  // 1 Luxury Bus = 40 guests = ₹15,000
  // 1 Sedan = 4 guests = ₹3,000
  
  const busesNeeded = Math.floor(guestCount / 40);
  const remainingGuests = guestCount % 40;
  const sedansNeeded = Math.ceil(remainingGuests / 4);

  const estimatedCost = (busesNeeded * 15000) + (sedansNeeded * 3000);

  await ToolAnalytics.create({
    toolName: 'Baraat Calculator',
    action: 'calculated_fleet',
    user: req.user ? req.user._id : null,
    metadata: { guestCount }
  });

  res.status(200).json({
    success: true,
    data: {
      totalCapacity: (busesNeeded * 40) + (sedansNeeded * 4),
      breakdown: {
        buses: busesNeeded,
        sedans: sedansNeeded,
        suvs: 0
      },
      totalVehicles: busesNeeded + sedansNeeded,
      estimatedCost
    }
  });
});

// Vendor Availability Checker
exports.vendorAvailability = catchAsync(async (req, res) => {
  const { category, date, city } = req.query;

  let filter = { status: 'approved' };
  
  if (category) {
    filter.categoryId = category; 
  }
  
  if (city) {
    // Basic regex match for city
    filter['address.city'] = new RegExp(city, 'i');
  }

  // Find all approved vendors matching city/category
  const potentialVendors = await Vendor.find(filter)
    .populate('categoryId', 'name icon')
    .select('businessName user averageRating totalReviews coverImage startingPrice city categoryId');

  // If date is provided, we would ideally cross-check with a bookings/availability collection.
  // For the sake of the tool, we will return the matching vendors and flag them as "Likely Available"
  // since the DB schema might not have an exhaustive availability matrix yet.
  
  await ToolAnalytics.create({
    toolName: 'Vendor Availability',
    action: 'checked_availability',
    user: req.user ? req.user._id : null,
    metadata: { category, date, city, results: potentialVendors.length }
  });

  res.status(200).json({
    success: true,
    data: potentialVendors
  });
});

// Vendor Comparison
exports.compareVendors = catchAsync(async (req, res) => {
  const { ids } = req.query; // comma separated vendor IDs
  if (!ids) {
    return res.status(400).json({ success: false, message: 'Vendor IDs required' });
  }

  const vendorIds = ids.split(',');
  
  const vendors = await Vendor.find({ _id: { $in: vendorIds } })
    .populate('categoryId', 'name')
    .select('businessName averageRating totalReviews startingPrice coverImage experienceYears features packages');

  await ToolAnalytics.create({
    toolName: 'Vendor Comparison',
    action: 'compared_vendors',
    user: req.user ? req.user._id : null,
    metadata: { count: vendors.length }
  });

  res.status(200).json({
    success: true,
    data: vendors
  });
});

// ==================== COST PREDICTOR CRUD ====================
exports.saveCostPrediction = catchAsync(async (req, res) => {
  const { city, guestCount, weddingType, services, totalEstimatedCost, rangeLow, rangeHigh, breakdown } = req.body;
  const prediction = await CostPrediction.create({
    user: req.user._id,
    city, guestCount, weddingType, services, totalEstimatedCost, rangeLow, rangeHigh, breakdown
  });
  res.status(201).json({ success: true, data: prediction });
});

exports.getCostPredictions = catchAsync(async (req, res) => {
  const predictions = await CostPrediction.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, data: predictions });
});

// ==================== BARAAT BOOKING REQUEST ====================
exports.createBaraatBooking = catchAsync(async (req, res) => {
  const { guestCount, distance, breakdown, estimatedCost } = req.body;
  const booking = await BaraatBookingRequest.create({
    user: req.user._id,
    guestCount, distance, breakdown, estimatedCost
  });
  
  // Also create a Lead for backend tracking
  await Lead.create({
    user: req.user._id,
    serviceType: new (require('mongoose').Types.ObjectId)(), // generic or specific category
    budget: estimatedCost || 0,
    city: 'N/A',
    eventDate: new Date(),
    description: `Baraat Fleet Booking Request: ${guestCount} guests. Need ${breakdown?.buses||0} buses, ${breakdown?.sedans||0} sedans.`,
    status: 'open'
  });

  res.status(201).json({ success: true, data: booking });
});

exports.getBaraatBookings = catchAsync(async (req, res) => {
  const bookings = await BaraatBookingRequest.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, data: bookings });
});

// ==================== BUDGET PLAN CRUD ====================
exports.saveBudgetPlan = catchAsync(async (req, res) => {
  const { totalBudget, allocations, customCategories } = req.body;
  
  // Find existing or create new
  let plan = await BudgetPlan.findOne({ user: req.user._id });
  if (plan) {
    plan.totalBudget = totalBudget;
    plan.allocations = allocations;
    plan.customCategories = customCategories;
    await plan.save();
  } else {
    plan = await BudgetPlan.create({
      user: req.user._id,
      totalBudget, allocations, customCategories
    });
  }
  
  res.status(200).json({ success: true, data: plan });
});

exports.getBudgetPlan = catchAsync(async (req, res) => {
  const plan = await BudgetPlan.findOne({ user: req.user._id });
  res.status(200).json({ success: true, data: plan });
});

// ==================== WEDDING PLAN (AI) CRUD ====================
exports.saveWeddingPlan = catchAsync(async (req, res) => {
  const { weddingDate, location, budget, guestCount, weddingType, roadmap } = req.body;
  const plan = await WeddingPlan.create({
    user: req.user._id,
    weddingDate, location, budget, guestCount, weddingType, roadmap
  });
  res.status(201).json({ success: true, message: 'Plan saved successfully', data: plan, errors: null });
});

exports.getWeddingPlans = catchAsync(async (req, res) => {
  const plans = await WeddingPlan.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, message: 'Plans fetched successfully', data: plans, errors: null });
});

exports.deleteWeddingPlan = catchAsync(async (req, res) => {
  await WeddingPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.status(200).json({ success: true, message: 'Plan deleted', data: null, errors: null });
});

// ==================== ASTROLOGY PREMIUM TOOLS ====================
const astrologyEngine = require('../utils/astrologyEngine');

exports.calculateKundli = catchAsync(async (req, res) => {
  const { bride, groom, language = 'en' } = req.body;
  if (!bride || !groom) {
    return res.status(400).json({ success: false, message: 'Bride and Groom details required' });
  }

  const report = astrologyEngine.calculateGunMilan(bride, groom);

  // Analytics tracking
  await ToolAnalytics.create({
    toolName: 'Kundli Matching',
    action: 'calculated_gun_milan',
    user: req.user ? req.user._id : null,
    metadata: { score: report.totalScore, percentage: report.percentage },
    language,
    state: bride.state || groom.state || ''
  });

  res.status(200).json({ success: true, data: report });
});

exports.saveKundli = catchAsync(async (req, res) => {
  const { brideName, groomName, totalScore, percentage, reportData, language = 'en' } = req.body;
  const { SavedKundli } = require('../models/ToolModels');
  
  const saved = await SavedKundli.create({
    user: req.user._id,
    brideName, groomName, totalScore, percentage, reportData, language
  });
  
  res.status(201).json({ success: true, data: saved });
});

exports.calculateMuhurat = catchAsync(async (req, res) => {
  const { city, state, year, month, brideName, groomName, language = 'en' } = req.body;
  if (!city || !year || !month) {
    return res.status(400).json({ success: false, message: 'City, year, and month required' });
  }

  const muhurats = astrologyEngine.calculateMuhurat(city, state, year, month, brideName, groomName);

  // Analytics tracking
  await ToolAnalytics.create({
    toolName: 'Shubh Muhurat Finder',
    action: 'calculated_muhurat',
    user: req.user ? req.user._id : null,
    metadata: { city, year, month },
    language,
    state
  });

  res.status(200).json({ success: true, data: muhurats });
});

exports.saveMuhurat = catchAsync(async (req, res) => {
  const { city, state, year, month, muhurats, language = 'en' } = req.body;
  const { SavedMuhurat } = require('../models/ToolModels');
  
  const saved = await SavedMuhurat.create({
    user: req.user._id,
    city, state, year, month, muhurats, language
  });
  
  res.status(201).json({ success: true, data: saved });
});

exports.getSavedKundlis = catchAsync(async (req, res) => {
  const { SavedKundli } = require('../models/ToolModels');
  const reports = await SavedKundli.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: reports });
});

exports.deleteSavedKundli = catchAsync(async (req, res) => {
  const { SavedKundli } = require('../models/ToolModels');
  await SavedKundli.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.status(204).json({ success: true });
});

exports.getSavedMuhurats = catchAsync(async (req, res) => {
  const { SavedMuhurat } = require('../models/ToolModels');
  const reports = await SavedMuhurat.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: reports });
});

exports.deleteSavedMuhurat = catchAsync(async (req, res) => {
  const { SavedMuhurat } = require('../models/ToolModels');
  await SavedMuhurat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.status(204).json({ success: true });
});
