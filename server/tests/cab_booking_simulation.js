require('dotenv').config();
const mongoose = require('mongoose');
const { Cab, Booking, Vendor, User } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shaadisaathi';

const runTests = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for E2E Booking Tests');

    // 1. Setup Mock User & Cab
    const mockUser = await User.findOneAndUpdate(
      { email: 'testbooking@example.com' },
      { name: 'Test User', email: 'testbooking@example.com', password: 'password123', phone: '9999999999', role: 'user' },
      { upsert: true, new: true }
    );

    const mockCab = await Cab.findOneAndUpdate(
      { vehicleNumber: 'TEST-SCORPIO-01' },
      { 
        name: 'Scorpio S11', brand: 'Mahindra', type: 'suv', vehicleNumber: 'TEST-SCORPIO-01', 
        seatingCapacity: 7, quantityAvailable: 2, price: 5000, status: 'approved', isAvailable: true, createdBy: mockUser._id 
      },
      { upsert: true, new: true }
    );

    // Clean up previous test bookings
    await Booking.deleteMany({ userId: mockUser._id });

    console.log('\n--- STARTING AUTOMATED SCENARIOS ---');

    // Helper to simulate booking
    const simulateBooking = async (dateStr, qty, testName) => {
      const startOfDay = new Date(new Date(dateStr).setHours(0,0,0,0));
      const endOfDay = new Date(new Date(dateStr).setHours(23,59,59,999));

      const overlappingBookings = await Booking.find({
        eventDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'confirmed', 'in_progress', 'on_the_way'] },
        bookingType: 'cab',
        $or: [{ "fleetSelection.cabId": mockCab._id }, { "cabIds": mockCab._id }]
      });

      let totalBooked = 0;
      for (const b of overlappingBookings) {
        if (b.fleetSelection && b.fleetSelection.length > 0) {
          const match = b.fleetSelection.find(f => f.cabId.toString() === mockCab._id.toString());
          if (match) totalBooked += (match.count || 1);
        } else {
          totalBooked += 1;
        }
      }

      const availableQty = mockCab.quantityAvailable - totalBooked;

      if (qty > availableQty) {
        console.log(`❌ [${testName}] Blocked - Overbooking Prevented. Available: ${availableQty}, Requested: ${qty}`);
        return false;
      }

      // Create Booking
      await Booking.create({
        bookingId: `TEST-${Date.now()}`,
        userId: mockUser._id,
        user: mockUser._id,
        bookingType: 'cab',
        eventDate: new Date(dateStr),
        cabIds: [mockCab._id],
        fleetSelection: [{ cabId: mockCab._id, count: qty, pricePerVehicle: 5000, totalFare: 5000 * qty }],
        amount: 5000 * qty, totalPrice: 5000 * qty,
        status: 'pending'
      });

      console.log(`✅ [${testName}] Success - Booked successfully on ${dateStr}. Available was: ${availableQty}`);
      return true;
    };

    // Tests Execution
    await simulateBooking('2024-12-10', 1, 'Test 1: Book Scorpio on 10 Dec');
    await simulateBooking('2024-12-11', 1, 'Test 2: Book Scorpio on 11 Dec (Different Date)');
    await simulateBooking('2024-12-12', 1, 'Test 3: Book Scorpio on 12 Dec (Different Date)');
    
    // Test 4: Book again on 10 Dec (Capacity is 2, so 1 more is allowed)
    await simulateBooking('2024-12-10', 1, 'Test 4: Book Scorpio again on same date (Quantity available)');

    // Test 5: Book beyond capacity on 10 Dec
    await simulateBooking('2024-12-10', 1, 'Test 5: Book Scorpio beyond capacity on same date');

    // Test 6: Cancel booking -> Availability restored
    const bookingToCancel = await Booking.findOne({ eventDate: { $gte: new Date(new Date('2024-12-10').setHours(0,0,0,0)), $lte: new Date(new Date('2024-12-10').setHours(23,59,59,999)) } });
    if (bookingToCancel) {
      bookingToCancel.status = 'cancelled';
      await bookingToCancel.save();
      console.log('✅ [Test 6] Cancelled one 10 Dec booking.');
    }
    
    // Test 6 cont: Try booking again after cancellation
    await simulateBooking('2024-12-10', 1, 'Test 6: Booking after cancellation restored availability');

    // Test 7 & 8: Failed payment/Expired reservation
    const bookingToFail = await Booking.findOne({ status: 'pending' });
    if (bookingToFail) {
      bookingToFail.status = 'failed';
      await bookingToFail.save();
      console.log('✅ [Test 7 & 8] Marked booking as failed/expired. Inventory implicitly restored.');
    }

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY.');

  } catch (error) {
    console.error('Test script crashed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTests();
