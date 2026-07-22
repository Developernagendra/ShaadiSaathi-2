const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const AstrologyReport = require('../models/AstrologyReport');
const { calculateCompatibility, findShubhMuhurat } = require('../utils/astrologyEngine');

exports.matchKundli = catchAsync(async (req, res, next) => {
  const { bride, groom } = req.body;
  
  if (!bride || !groom || !bride.dob || !groom.dob) {
    return next(new AppError('Please provide complete birth details for both bride and groom.', 400));
  }

  // Ensure dates are parsed correctly
  const brideDate = new Date(`${bride.dob}T${bride.timeOfBirth || '12:00:00'}Z`);
  const groomDate = new Date(`${groom.dob}T${groom.timeOfBirth || '12:00:00'}Z`);

  if (isNaN(brideDate) || isNaN(groomDate)) {
    return next(new AppError('Invalid date or time format provided.', 400));
  }

  const results = calculateCompatibility(brideDate, groomDate);

  // Save report if user is logged in
  let reportId = null;
  
  const newReport = await AstrologyReport.create({
    userId: req.user ? req.user._id : null,
    reportType: 'kundli',
    brideDetails: bride,
    groomDetails: groom,
    results
  });
  reportId = newReport._id;

  res.status(200).json({
    status: 'success',
    data: {
      reportId,
      matchResults: results
    }
  });
});

exports.findMuhurat = catchAsync(async (req, res, next) => {
  const { location, startDate, endDate, bride, groom } = req.body;
  
  if (!location || !startDate || !endDate) {
    return next(new AppError('Please provide location, start date, and end date.', 400));
  }

  const results = findShubhMuhurat(startDate, endDate);

  const newReport = await AstrologyReport.create({
    userId: req.user ? req.user._id : null,
    reportType: 'muhurat',
    muhuratDetails: { location, startDate, endDate },
    brideDetails: bride,
    groomDetails: groom,
    results
  });

  res.status(200).json({
    status: 'success',
    data: {
      reportId: newReport._id,
      muhuratResults: results
    }
  });
});

exports.getReport = catchAsync(async (req, res, next) => {
  const report = await AstrologyReport.findById(req.params.id).populate('userId', 'name email');
  
  if (!report) {
    return next(new AppError('No report found with that ID', 404));
  }
  
  // Security check: Only admin or the report owner can view it
  if (req.user && req.user.role !== 'admin' && report.userId && report.userId._id.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to view this report.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.getMyReports = catchAsync(async (req, res, next) => {
  const reports = await AstrologyReport.find({ userId: req.user._id }).sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: {
      reports
    }
  });
});

exports.getAllReportsAdmin = catchAsync(async (req, res, next) => {
  const reports = await AstrologyReport.find().sort('-createdAt').populate('userId', 'name email');
  
  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: {
      reports
    }
  });
});
