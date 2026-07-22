const mongoose = require('mongoose');
const { WeddingPlan, WeddingEvent, WeddingBudget, Guest, Checklist, Vendor } = require('../models');
const { sendNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ==========================================
// UTILS & TEMPLATES
// ==========================================

// Create a unique plan ID
const generatePlanId = () => {
  return `WED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Hardcoded Templates per User Request
const getTimelineTemplate = (region, weddingDate) => {
  const events = [];
  const baseDate = weddingDate ? new Date(weddingDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

  const addEvent = (title, daysOffset, description) => {
    const eventDate = new Date(baseDate);
    eventDate.setDate(eventDate.getDate() + daysOffset);
    events.push({ title, date: eventDate, description });
  };

  if (region === 'Mithila' || region === 'Maithili Wedding') {
    addEvent('Siddhant (Fixing the Alliance)', -60, 'Formal agreement and fixing of the marriage date by Panjikar.');
    addEvent('Phaldan & Tilak', -30, 'Groom receives gifts and blessings from bride\'s family.');
    addEvent('Kumkum & Ubtan (Haldi)', -2, 'Application of turmeric paste on bride and groom.');
    addEvent('Matkor', -1, 'Worshipping the local deity and mud collection ceremony.');
    addEvent('Baraat Arrival & Swagat', 0, 'Arrival of the groom\'s procession.');
    addEvent('Parichawan & Jaimala', 0, 'Welcoming the groom and exchange of garlands.');
    addEvent('Kanyadaan & Vivah', 0, 'The main wedding rituals.');
    addEvent('Kohbar (Nuptial Chamber)', 0, 'Traditional Mithila painting room rituals.');
    addEvent('Bidaai', 1, 'Farewell of the bride.');
  } else {
    // General Bihar
    addEvent('Tilak & Sagai', -30, 'Engagement and formalization.');
    addEvent('Haldi & Matkor', -1, 'Turmeric ceremony and seeking blessings.');
    addEvent('Baraat & Jaimala', 0, 'Groom\'s procession and garland exchange.');
    addEvent('Vivah', 0, 'Main wedding rituals.');
    addEvent('Bidaai', 1, 'Bride\'s farewell.');
    addEvent('Reception', 2, 'Celebration at groom\'s place.');
  }
  return events;
};

const getBudgetTemplate = () => {
  return [
    { name: 'Venue & Vivah Bhawan', estimatedCost: 100000 },
    { name: 'Catering (Bhoj)', estimatedCost: 150000 },
    { name: 'Tent & Decoration', estimatedCost: 80000 },
    { name: 'Photography & Videography', estimatedCost: 50000 },
    { name: 'Jewellery', estimatedCost: 200000 },
    { name: 'Bridal & Groom Wear', estimatedCost: 50000 },
    { name: 'Baraat (Band, DJ, Ghodi, Cabs)', estimatedCost: 40000 },
    { name: 'Pandit & Puja Samagri', estimatedCost: 10000 },
    { name: 'Invitations', estimatedCost: 10000 },
    { name: 'Miscellaneous', estimatedCost: 30000 }
  ];
};

const getChecklistTemplate = () => {
  return [
    { title: 'Determine Wedding Budget', category: 'Planning' },
    { title: 'Select Wedding Date & Region', category: 'Planning' },
    { title: 'Book Vivah Bhawan / Venue', category: 'Vendors' },
    { title: 'Hire Caterer', category: 'Vendors' },
    { title: 'Book Photographer & Videographer', category: 'Vendors' },
    { title: 'Book Tent & Decoration', category: 'Vendors' },
    { title: 'Buy Bridal & Groom Outfits', category: 'Shopping' },
    { title: 'Finalize Guest List', category: 'Guests' },
    { title: 'Send Invitations', category: 'Guests' },
    { title: 'Book Baraat Transportation', category: 'Vendors' },
  ];
};

// ==========================================
// CONTROLLERS
// ==========================================

// @desc    Create a new wedding plan
// @route   POST /api/weddings
// @access  Private
exports.createWeddingPlan = catchAsync(async (req, res, next) => {
  const { brideName, groomName, weddingDate, city, district, state, venue, guestCount, budget, weddingStyle, weddingType, region } = req.body;

  // Check if user already has an active plan
  const existingPlan = await WeddingPlan.findOne({ user: req.user._id, status: 'active' });
  if (existingPlan) {
    return next(new AppError('You already have an active wedding plan. Archive or complete it to create a new one.', 400));
  }

  // 1. Create Core Plan
  const plan = await WeddingPlan.create({
    user: req.user._id,
    planId: generatePlanId(),
    brideName,
    groomName,
    weddingDate,
    city,
    district,
    state: state || 'Bihar',
    venue,
    guestCount,
    budget,
    weddingStyle,
    weddingType,
    region
  });

  // 2. Generate and Insert Timeline Events
  const events = getTimelineTemplate(region, weddingDate).map(e => ({
    ...e,
    weddingPlan: plan._id
  }));
  await WeddingEvent.insertMany(events);

  // 3. Generate and Insert Budget
  await WeddingBudget.create({
    weddingPlan: plan._id,
    categories: getBudgetTemplate()
  });

  // 4. Generate and Insert Checklist
  await Checklist.create({
    user: req.user._id,
    weddingPlan: plan._id,
    tasks: getChecklistTemplate()
  });

  // Notify (In-App)
  await sendNotification({
    recipient: req.user._id,
    sender: req.user._id, // system
    type: 'system',
    title: 'Wedding Plan Created! 🎉',
    message: `Your ${weddingType || 'Bihari'} wedding plan has been successfully created.`,
    link: `/user/wedding-planner`
  });

  res.status(201).json({
    success: true,
    plan
  });
});

// @desc    Get active wedding plan for user
// @route   GET /api/weddings/my
// @access  Private
exports.getMyWeddingPlan = catchAsync(async (req, res, next) => {
  const plan = await WeddingPlan.findOne({ user: req.user._id, status: 'active' });

  if (!plan) {
    return res.status(200).json({ success: true, plan: null });
  }

  // Fetch linked aggregates
  const events = await WeddingEvent.find({ weddingPlan: plan._id }).sort({ date: 1 });
  const budget = await WeddingBudget.findOne({ weddingPlan: plan._id });
  const guests = await Guest.find({ weddingPlan: plan._id });
  const checklist = await Checklist.findOne({ weddingPlan: plan._id });

  // Calculate high-level progress
  const totalTasks = checklist?.tasks?.length || 0;
  const completedTasks = checklist?.tasks?.filter(t => t.isCompleted)?.length || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  res.status(200).json({
    success: true,
    plan,
    events,
    budget,
    guests,
    checklist,
    metrics: {
      progress,
      totalTasks,
      completedTasks,
      totalGuests: guests.length,
      confirmedGuests: guests.filter(g => g.rsvpStatus === 'attending').length
    }
  });
});

// @desc    Update Wedding Plan details
// @route   PUT /api/weddings/:id
// @access  Private
exports.updateWeddingPlan = catchAsync(async (req, res, next) => {
  const plan = await WeddingPlan.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!plan) return next(new AppError('Wedding plan not found', 404));

  res.status(200).json({ success: true, plan });
});


// ==========================================
// EVENTS (TIMELINE)
// ==========================================

exports.createEvent = catchAsync(async (req, res, next) => {
  const plan = await WeddingPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) return next(new AppError('Plan not found', 404));

  const event = await WeddingEvent.create({ ...req.body, weddingPlan: plan._id });
  res.status(201).json({ success: true, event });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const event = await WeddingEvent.findByIdAndUpdate(req.params.eventId, req.body, { new: true });
  res.status(200).json({ success: true, event });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  await WeddingEvent.findByIdAndDelete(req.params.eventId);
  res.status(200).json({ success: true, data: {} });
});


// ==========================================
// GUESTS
// ==========================================

exports.addGuest = catchAsync(async (req, res, next) => {
  const plan = await WeddingPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) return next(new AppError('Plan not found', 404));

  const guest = await Guest.create({ ...req.body, user: req.user._id, weddingPlan: plan._id });
  res.status(201).json({ success: true, guest });
});

exports.updateGuest = catchAsync(async (req, res, next) => {
  const guest = await Guest.findByIdAndUpdate(req.params.guestId, req.body, { new: true });
  res.status(200).json({ success: true, guest });
});

exports.deleteGuest = catchAsync(async (req, res, next) => {
  await Guest.findByIdAndDelete(req.params.guestId);
  res.status(200).json({ success: true, data: {} });
});


// ==========================================
// BUDGET
// ==========================================

exports.updateBudgetCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;
  const { estimatedCost, actualCost, paidAmount, name } = req.body;
  
  const budget = await WeddingBudget.findOne({ weddingPlan: req.params.id });
  if (!budget) return next(new AppError('Budget not found', 404));

  const category = budget.categories.id(categoryId);
  if (!category) return next(new AppError('Category not found', 404));

  if (estimatedCost !== undefined) category.estimatedCost = estimatedCost;
  if (actualCost !== undefined) category.actualCost = actualCost;
  if (paidAmount !== undefined) category.paidAmount = paidAmount;
  if (name !== undefined) category.name = name;

  await budget.save();
  res.status(200).json({ success: true, budget });
});

exports.addBudgetCategory = catchAsync(async (req, res, next) => {
  const budget = await WeddingBudget.findOne({ weddingPlan: req.params.id });
  if (!budget) return next(new AppError('Budget not found', 404));

  budget.categories.push(req.body);
  await budget.save();
  res.status(201).json({ success: true, budget });
});

exports.deleteBudgetCategory = catchAsync(async (req, res, next) => {
  const budget = await WeddingBudget.findOne({ weddingPlan: req.params.id });
  budget.categories.pull({ _id: req.params.categoryId });
  await budget.save();
  res.status(200).json({ success: true, budget });
});

// ==========================================
// CHECKLIST
// ==========================================
exports.updateChecklist = catchAsync(async (req, res, next) => {
  const { taskId, isCompleted, title, category, notes, deadline } = req.body;
  
  const checklist = await Checklist.findOne({ weddingPlan: req.params.id });
  if (!checklist) return next(new AppError('Checklist not found', 404));

  if (taskId) {
    // Update existing
    const task = checklist.tasks.id(taskId);
    if (!task) return next(new AppError('Task not found', 404));
    
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    if (title !== undefined) task.title = title;
    if (category !== undefined) task.category = category;
    if (notes !== undefined) task.notes = notes;
    if (deadline !== undefined) task.deadline = deadline;
  } else {
    // Add new
    checklist.tasks.push({ title, category, notes, deadline, isCompleted: false });
  }

  await checklist.save();
  res.status(200).json({ success: true, checklist });
});


// ==========================================
// VENDOR RECOMMENDATIONS (Smart Logic)
// ==========================================
exports.getRecommendations = catchAsync(async (req, res, next) => {
  const plan = await WeddingPlan.findById(req.params.id);
  if (!plan) return next(new AppError('Plan not found', 404));

  // Find vendors in the plan's city, matching approval status
  // We reuse the existing Vendor schema and query.
  const recommendedVendors = await Vendor.find({ 
    'businessAddress.city': { $regex: new RegExp(plan.city, 'i') },
    approvalStatus: 'approved'
  })
  .populate('category', 'name icon slug')
  .sort({ averageRating: -1 }) // Best first
  .limit(12);

  res.status(200).json({ success: true, vendors: recommendedVendors });
});
