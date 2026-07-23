const { ExpertConsultation } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail, getExpertUserEmailHTML, getExpertAdminEmailHTML } = require('../services/emailService');

// @desc    Submit new expert consultation request
// @route   POST /api/expert-consultations
// @access  Public
exports.submitConsultation = catchAsync(async (req, res, next) => {
  const { name, email, phone, package, service, weddingDate, city, guestCount, preferredDate, preferredTime, message } = req.body;

  if (!name || !email || !phone) {
    return next(new AppError('Name, email, and phone are required', 400));
  }

  let normalizedPackage = package ? String(package).trim() : null;
  let normalizedService = service ? String(service).trim() : null;

  const newConsultation = await ExpertConsultation.create({
    name,
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    package: normalizedPackage,
    service: normalizedService,
    weddingDate,
    city,
    guestCount,
    preferredDate,
    preferredTime,
    message
  });

  // Send Emails
  try {
    if (typeof getExpertUserEmailHTML === 'function') {
      await sendEmail({
        to: email,
        subject: 'ShaadiSaathi – Expert Consultation Request Received',
        html: getExpertUserEmailHTML(name, normalizedPackage)
      });
    }
  } catch (error) {
    console.error('[EXPERT_CONSULTATION] ❌ USER_EMAIL_FAILED:', error.message);
  }

  try {
    const adminEmail = process.env.EMAIL_FROM;
    if (adminEmail && typeof getExpertAdminEmailHTML === 'function') {
      await sendEmail({
        to: adminEmail,
        subject: 'New Expert Consultation Request – ShaadiSaathi',
        html: getExpertAdminEmailHTML(newConsultation)
      });
    }
  } catch (error) {
    console.error('[EXPERT_CONSULTATION] ❌ ADMIN_EMAIL_FAILED:', error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Your expert consultation request has been submitted successfully.',
    data: newConsultation
  });
});

// @desc    Get all expert consultations
// @route   GET /api/expert-consultations
// @access  Private/Admin
exports.getConsultations = catchAsync(async (req, res, next) => {
  const consultations = await ExpertConsultation.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: consultations.length,
    data: consultations
  });
});

// @desc    Update consultation status
// @route   PUT /api/expert-consultations/:id
// @access  Private/Admin
exports.updateConsultation = catchAsync(async (req, res, next) => {
  const { status, note, assignedExpert } = req.body;

  const updateData = {};
  if (status) updateData.status = status;
  if (assignedExpert) updateData.assignedExpert = assignedExpert;
  
  if (note) {
    updateData.$push = { notes: { text: note } };
  }

  const consultation = await ExpertConsultation.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!consultation) {
    return next(new AppError('No consultation found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: consultation
  });
});

// @desc    Delete consultation
// @route   DELETE /api/expert-consultations/:id
// @access  Private/Admin
exports.deleteConsultation = catchAsync(async (req, res, next) => {
  const consultation = await ExpertConsultation.findByIdAndDelete(req.params.id);

  if (!consultation) {
    return next(new AppError('No consultation found with that ID', 404));
  }

  res.status(204).json({
    success: true,
    data: null
  });
});
