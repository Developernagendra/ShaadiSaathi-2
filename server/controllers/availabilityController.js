const { Availability, Vendor } = require('../models/index');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Helper to get vendor from req.user or query
const getVendorForAction = async (req, res) => {
  if (req.user.role === 'admin' && req.query.vendorId) {
    const vendor = await Vendor.findById(req.query.vendorId);
    if (!vendor) return null;
    return vendor;
  }
  const vendor = await Vendor.findOne({ user: req.user._id });
  return vendor; // Might be null
};

// @desc    Get vendor availability (Vendor view)
// @route   GET /api/availability/vendor
// @access  Private (vendor)
exports.getVendorAvailability = catchAsync(async (req, res, next) => {
  const vendor = await getVendorForAction(req, res);
  if (!vendor) {
    return res.status(200).json({ status: 'success', hasProfile: false, availability: [] });
  }

  const { month, year } = req.query;

  let query = { vendorId: vendor._id };

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    query.date = { $gte: startDate, $lte: endDate };
  }

  const availability = await Availability.find(query).sort({ date: 1 });

  res.status(200).json({
    status: 'success',
    availability
  });
});

// @desc    Update/Create availability (Vendor management)
// @route   POST /api/availability
// @access  Private (vendor)
exports.updateAvailability = catchAsync(async (req, res, next) => {
  const vendor = await getVendorForAction(req, res);
  if (!vendor) return next(new AppError('Vendor profile not found to update availability.', 404));
  const { date, slots, maxBookings, isBlocked, blockReason } = req.body;

  if (!date) return next(new AppError('Date is required.', 400));

  const formattedDate = new Date(date);
  formattedDate.setHours(0, 0, 0, 0);

  // Calculate status based on slots if provided, otherwise top level
  let status = 'available';
  if (isBlocked) {
    status = 'blocked';
  }

  const availability = await Availability.findOneAndUpdate(
    { vendorId: vendor._id, date: formattedDate },
    {
      vendorId: vendor._id,
      date: formattedDate,
      slots: slots || [],
      maxBookings: maxBookings || 1,
      isBlocked: isBlocked || false,
      blockReason: blockReason || '',
      status
    },
    { new: true, upsert: true, runValidators: true }
  );

  if (vendor.unavailableDates === undefined) vendor.unavailableDates = [];
  
  if (isBlocked || maxBookings === 0) {
    const exists = vendor.unavailableDates.some(ud => {
      const dObj = new Date(ud);
      dObj.setHours(0,0,0,0);
      return dObj.getTime() === formattedDate.getTime();
    });
    if (!exists) vendor.unavailableDates.push(formattedDate);
  } else {
    vendor.unavailableDates = vendor.unavailableDates.filter(ud => {
      const dObj = new Date(ud);
      dObj.setHours(0,0,0,0);
      return dObj.getTime() !== formattedDate.getTime();
    });
  }
  await vendor.save();

  res.status(200).json({
    status: 'success',
    availability
  });
});

// @desc    Get public availability (User view)
// @route   GET /api/vendors/:id/availability
// @access  Public
exports.getPublicAvailability = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { month, year } = req.query;

  let query = { vendorId: id };

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    query.date = { $gte: startDate, $lte: endDate };
  } else {
    // Default to next 3 months
    const today = new Date();
    today.setHours(0,0,0,0);
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    query.date = { $gte: today, $lte: threeMonthsLater };
  }

  const availability = await Availability.find(query).sort({ date: 1 });

  res.status(200).json({
    status: 'success',
    availability
  });
});

// @desc    Bulk update availability
// @route   POST /api/availability/bulk
// @access  Private (vendor)
exports.bulkUpdateAvailability = catchAsync(async (req, res, next) => {
  const vendor = await getVendorForAction(req, res);
  if (!vendor) return next(new AppError('Vendor profile not found for bulk update.', 404));
  const { dates, action, slots, maxBookings } = req.body;

  if (!dates || !Array.isArray(dates)) {
    return next(new AppError('Dates array is required.', 400));
  }

  const operations = dates.map(d => {
    const date = new Date(d);
    date.setHours(0,0,0,0);
    
    let update = { 
      vendorId: vendor._id, 
      date,
    };

    if (action === 'block') {
      update.isBlocked = true;
      update.status = 'blocked';
    } else if (action === 'available') {
      update.isBlocked = false;
      update.status = 'available';
      if (slots) update.slots = slots;
      if (maxBookings) update.maxBookings = maxBookings;
    }

    return {
      updateOne: {
        filter: { vendorId: vendor._id, date },
        update: { $set: update },
        upsert: true
      }
    };
  });

  await Availability.bulkWrite(operations);

  if (vendor.unavailableDates === undefined) vendor.unavailableDates = [];
  
  if (action === 'block') {
    dates.forEach(d => {
      const date = new Date(d);
      date.setHours(0,0,0,0);
      const exists = vendor.unavailableDates.some(ud => {
        const dObj = new Date(ud);
        dObj.setHours(0,0,0,0);
        return dObj.getTime() === date.getTime();
      });
      if (!exists) vendor.unavailableDates.push(date);
    });
  } else if (action === 'available') {
    vendor.unavailableDates = vendor.unavailableDates.filter(ud => {
      const dObj = new Date(ud);
      dObj.setHours(0,0,0,0);
      const dateStr = dObj.toISOString().split('T')[0];
      return !dates.some(d => {
        const innerDate = new Date(d);
        innerDate.setHours(0,0,0,0);
        return innerDate.toISOString().split('T')[0] === dateStr;
      });
    });
  }
  await vendor.save();

  res.status(200).json({
    status: 'success',
    message: 'Bulk availability updated.'
  });
});

// @desc    Delete availability record
// @route   DELETE /api/availability/:id
// @access  Private (vendor)
exports.deleteAvailability = catchAsync(async (req, res, next) => {
  const vendor = await getVendorForAction(req, res);
  if (!vendor) return next(new AppError('Vendor profile not found to delete.', 404));
  const availability = await Availability.findOneAndDelete({
    _id: req.params.id,
    vendorId: vendor._id
  });

  if (!availability) {
    return next(new AppError('Availability record not found.', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
