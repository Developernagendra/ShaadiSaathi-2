const { PackageInquiry, Package } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail, getPackageUserEmailHTML, getPackageAdminEmailHTML } = require('../services/emailService');

// @desc    Submit new package inquiry
// @route   POST /api/package-inquiries
// @access  Public
exports.submitInquiry = catchAsync(async (req, res, next) => {
  const { name, phone, email, weddingDate, city, guestsCount, package: packageName, specialRequirements, budget, message } = req.body;

  // Safe logging
  console.log("[PACKAGE INQUIRY] Received package:", packageName);

  if (!packageName) {
    return res.status(400).json({
      success: false,
      message: "Package is required"
    });
  }

  // Normalize package name
  const normalizedPackage = String(packageName || "").trim().toLowerCase();

  // Dynamic validation: check against packages in the database
  // Also accept legacy/known package tier names as fallback
  const LEGACY_PACKAGES = ["silver", "gold", "premium", "royal", "custom"];
  let isValid = LEGACY_PACKAGES.includes(normalizedPackage);

  if (!isValid) {
    // Check if it matches an actual package name or slug in the DB
    const dbPackage = await Package.findOne({
      $or: [
        { slug: normalizedPackage },
        { name: { $regex: new RegExp(`^${normalizedPackage}$`, 'i') } }
      ],
      deletedAt: null
    });
    isValid = !!dbPackage;
  }

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: `Package "${normalizedPackage}" is not available. Please select a valid wedding package.`,
    });
  }

  // Create inquiry
  const newInquiry = await PackageInquiry.create({
    name,
    phone,
    email,
    weddingDate,
    city,
    guestsCount,
    package: normalizedPackage,
    specialRequirements,
    budget,
    message
  });

  // Send Email to User (if email provided)
  if (email) {
    try {
      await sendEmail({
        to: email,
        subject: `We've received your Wedding Package Inquiry! 💍`,
        html: getPackageUserEmailHTML(name, normalizedPackage)
      });
      console.log(`[PACKAGE_INQUIRY] ✅ User confirmation email sent to: ${email}`);
    } catch (error) {
      console.error('[PACKAGE_INQUIRY] ❌ USER_EMAIL_FAILED:');
      console.error(`[PACKAGE_INQUIRY]    → Email : ${email}`);
      console.error(`[PACKAGE_INQUIRY]    → Error : ${error.message}`);
    }
  }

  // Send Alert to Admin
  const adminEmail = process.env.EMAIL_FROM;
  if (adminEmail) {
    try {
      await sendEmail({
        to: adminEmail,
        subject: `🚨 New Package Inquiry: ${normalizedPackage}`,
        html: getPackageAdminEmailHTML(newInquiry, { name: normalizedPackage })
      });
      console.log(`[PACKAGE_INQUIRY] ✅ Admin alert email sent to: ${adminEmail}`);
    } catch (error) {
      console.error('[PACKAGE_INQUIRY] ❌ ADMIN_EMAIL_FAILED:');
      console.error(`[PACKAGE_INQUIRY]    → Error : ${error.message}`);
    }
  } else {
    console.warn('[PACKAGE_INQUIRY] ⚠️ EMAIL_FROM not set — skipping admin alert');
  }

  res.status(201).json({
    success: true,
    data: newInquiry
  });
});

// @desc    Get all inquiries
// @route   GET /api/package-inquiries
// @access  Private/Admin
exports.getInquiries = catchAsync(async (req, res, next) => {
  const inquiries = await PackageInquiry.find()
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: inquiries.length,
    data: inquiries
  });
});

// @desc    Update inquiry (status, budget, assignment, notes)
// @route   PUT /api/package-inquiries/:id
// @access  Private/Admin
exports.updateInquiry = catchAsync(async (req, res, next) => {
  const { status, note, budget, assignedVendor } = req.body;

  const updateData = {};
  if (status) updateData.status = status;
  if (budget) updateData.budget = budget;
  if (assignedVendor) updateData.assignedVendor = assignedVendor;

  if (note) {
    updateData.$push = { notes: { text: note } };
  }

  const inquiry = await PackageInquiry.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!inquiry) {
    return next(new AppError('No inquiry found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: inquiry
  });
});

// @desc    Delete inquiry
// @route   DELETE /api/package-inquiries/:id
// @access  Private/Admin
exports.deleteInquiry = catchAsync(async (req, res, next) => {
  const inquiry = await PackageInquiry.findByIdAndDelete(req.params.id);

  if (!inquiry) {
    return next(new AppError('No inquiry found with that ID', 404));
  }

  res.status(204).json({
    success: true,
    data: null
  });
});
