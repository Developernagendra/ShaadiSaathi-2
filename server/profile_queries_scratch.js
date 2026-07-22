require('dotenv').config();
const mongoose = require('mongoose');
const { Booking, User, Vendor, Review } = require('./models/index');

async function runBenchmark() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to Database.');

  // Find a sample vendor user to test vendor dashboard queries
  const sampleVendor = await Vendor.findOne().lean();
  const sampleVendorUser = sampleVendor ? sampleVendor.user : null;

  console.log('\n======================================================');
  console.log('⚡ PROFILING MONGO QUERIES (OPTIMIZED SYSTEM) ⚡');
  console.log('======================================================');

  // Benchmark 1: Admin Stats Queries
  console.log('\n📊 BENCHMARK 1: getAdminStats Queries');
  console.time('Total getAdminStats Queries Time');
  
  console.time('  User.countDocuments');
  const userCount = await User.countDocuments({ role: 'user' });
  console.timeEnd('  User.countDocuments');

  console.time('  Vendor.countDocuments (approved)');
  const vendorCount = await Vendor.countDocuments({ approvalStatus: 'approved' });
  console.timeEnd('  Vendor.countDocuments (approved)');

  console.time('  Booking.countDocuments');
  const bookingCount = await Booking.countDocuments();
  console.timeEnd('  Booking.countDocuments');

  console.time('  User.find().lean().select()');
  const recentUsers = await User.find({ role: 'user' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email avatar createdAt')
    .lean();
  console.timeEnd('  User.find().lean().select()');

  console.time('  Vendor.find().lean().select().populate()');
  const recentVendors = await Vendor.find({ approvalStatus: 'pending' })
    .select('businessName category user createdAt approvalStatus')
    .populate('user', 'name email')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  console.timeEnd('  Vendor.find().lean().select().populate()');

  console.time('  Booking.aggregate (Revenue stats)');
  const revData = await Booking.aggregate([
    {
      $facet: {
        totalRevenue: [
          { $match: { paymentStatus: { $in: ['partial_paid', 'paid', 'advance_paid', 'fully_paid'] } } },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $cond: [
                    { $in: ['$paymentStatus', ['paid', 'fully_paid']] },
                    '$totalPrice',
                    '$advanceAmount'
                  ]
                }
              }
            }
          }
        ]
      }
    }
  ]);
  console.timeEnd('  Booking.aggregate (Revenue stats)');

  console.timeEnd('Total getAdminStats Queries Time');


  // Benchmark 2: Booking Admin Queries (With lean, select, populate pruning)
  console.log('\n📖 BENCHMARK 2: getAllBookingsAdmin Queries');
  console.time('Total getAllBookingsAdmin Queries Time');

  console.time('  Booking.find().lean().select().populate()');
  const bookings = await Booking.find()
    .select('bookingId userId contactName contactPhone contactEmail vendorProfileId bookingType serviceName serviceCategory eventDate eventCity guestCount amount totalPrice status createdAt pickupLocation vehicles')
    .populate('userId', 'name email phone avatar')
    .populate('vendorProfileId', 'businessName location phone')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  console.timeEnd('  Booking.find().lean().select().populate()');

  console.timeEnd('Total getAllBookingsAdmin Queries Time');


  // Benchmark 3: Vendor Dashboard Queries
  if (sampleVendorUser) {
    console.log(`\n🏪 BENCHMARK 3: getVendorDashboard Queries for Vendor User: ${sampleVendorUser}`);
    console.time('Total getVendorDashboard Queries Time');

    console.time('  Booking.aggregate (Service stats)');
    const bookingStats = await Booking.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(sampleVendorUser), bookingType: 'service' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
    ]);
    console.timeEnd('  Booking.aggregate (Service stats)');

    console.time('  Booking.find().lean().select().populate()');
    const recentVendorBookings = await Booking.find({ vendorId: sampleVendorUser, bookingType: 'service' })
      .select('bookingId userId contactName eventDate status amount createdAt bookingType')
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    console.timeEnd('  Booking.find().lean().select().populate()');

    console.time('  Review.find().lean().select().populate()');
    const recentReviews = await Review.find({ vendor: sampleVendor._id })
      .select('user rating comment createdAt')
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    console.timeEnd('  Review.find().lean().select().populate()');

    console.timeEnd('Total getVendorDashboard Queries Time');
  } else {
    console.log('\n⚠️ Skipped Vendor Dashboard queries benchmark because no Vendor profile was found in DB.');
  }

  console.log('\n======================================================');
  console.log('✅ BENCHMARK COMPLETE');
  console.log('======================================================');
  
  await mongoose.connection.close();
}

runBenchmark().catch(err => {
  console.error('❌ Error during benchmark:', err);
  mongoose.connection.close();
});
