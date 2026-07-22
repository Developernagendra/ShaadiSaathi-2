const mongoose = require('mongoose');
require('dotenv').config({ override: true });

const testPerformance = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    const Vendor = require('./models/Vendor');
    const { Service, Booking, Review } = require('./models/index');

    // Find any vendor user to test
    const vendorUser = await User.findOne({ role: 'vendor' }).lean();
    if (!vendorUser) {
      console.log('⚠️ No vendor user found in database to test vendor-specific routes.');
    } else {
      console.log(`Found test vendor user: ${vendorUser.email}`);

      // Test 1: User Profile Query Performance with lean
      console.log('\n--- Test 1: User Profile Query (with populate and lean) ---');
      console.time('User Profile Query Time');
      const user = await User.findById(vendorUser._id)
        .populate('wishlist', 'businessName images basePrice location rating category')
        .lean();
      
      let vendorProfile = null;
      if (user && user.role === 'vendor') {
        vendorProfile = await Vendor.findOne({ user: user._id })
          .populate('category', 'name slug')
          .lean();
      }
      console.timeEnd('User Profile Query Time');
      console.log('Profile retrieved successfully.');
    }

    // Test 2: Services Fetching Database-Level Pagination vs Memory
    console.log('\n--- Test 2: Services Fetching (Database-Level Pagination) ---');
    console.time('Services Fetching Time');
    const { page = 1, limit = 12, sortBy = 'createdAt' } = {};
    const query = { isActive: true, status: 'approved' };
    
    // restrictive vendor query simulation
    const approvedVendors = await Vendor.find({ approvalStatus: 'approved' }).select('_id').lean();
    const approvedVendorIds = approvedVendors.map(v => v._id);
    query.vendor = { $in: approvedVendorIds };

    const sortOptions = {};
    sortOptions.createdAt = -1;

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('vendor', 'businessName location rating images approvalStatus')
      .populate('category', 'name slug icon')
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    console.timeEnd('Services Fetching Time');
    console.log(`Fetched ${services.length} services (Total in DB matches filters: ${total})`);

    // Test 3: Vendor Dashboard Aggregation
    if (vendorUser) {
      const vendor = await Vendor.findOne({ user: vendorUser._id }).lean();
      if (vendor) {
        console.log('\n--- Test 3: Vendor Dashboard Aggregations (Lean + parallelized) ---');
        console.time('Dashboard Aggregations Time');
        const [
          bookingStats, recentBookings, recentReviews, monthlyBookings,
          cabStats, recentCabBookings, monthlyCabBookings, totalCabs,
          paymentStats
        ] = await Promise.all([
          Booking.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), bookingType: 'service' } },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$amount' },
              },
            },
          ]),
          Booking.find({ vendorId: vendor.user, bookingType: 'service' })
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
          Review.find({ vendor: vendor._id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
          Booking.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), status: 'completed', bookingType: 'service' } },
            {
              $group: {
                _id: {
                  year: { $year: '$eventDate' },
                  month: { $month: '$eventDate' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$amount' }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
          ]),
          Booking.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), bookingType: { $in: ['cab', 'baraat-cab'] } } },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$amount' },
              },
            },
          ]),
          Booking.find({ vendorId: vendor.user, bookingType: { $in: ['cab', 'baraat-cab'] } })
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
          Booking.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user), status: 'completed', bookingType: { $in: ['cab', 'baraat-cab'] } } },
            {
              $group: {
                _id: {
                  year: { $year: '$eventDate' },
                  month: { $month: '$eventDate' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$amount' }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
          ]),
          require('./models/index').Cab.countDocuments({ vendor: vendor._id }),
          Booking.aggregate([
            { $match: { vendorId: new mongoose.Types.ObjectId(vendor.user._id || vendor.user) } },
            {
              $group: {
                _id: '$paymentStatus',
                count: { $sum: 1 },
                revenue: {
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
          ])
        ]);
        console.timeEnd('Dashboard Aggregations Time');
        console.log(`Aggregation successful. Cabs count: ${totalCabs}`);
      }
    }

    console.log('\n✅ All performance tests completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('💥 Test error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

testPerformance();
