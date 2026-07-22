const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/nagendrakumarsharma/Desktop/Ravi/server/.env' });
const { Cab, Booking } = require('/Users/nagendrakumarsharma/Desktop/Ravi/server/models/index');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const cabDoc = await Cab.findOne();
  if (!cabDoc) {
    console.log('No cab found');
    process.exit(0);
  }

  console.log(`Testing Cab: ${cabDoc._id} - ${cabDoc.name || cabDoc.brand}`);
  console.log(`totalFleet: ${cabDoc.totalFleet}`);
  console.log(`quantityAvailable: ${cabDoc.quantityAvailable}`);

  const eventDate = new Date(); // Today
  const requestedQty = 1;
  const maxFleetSize = Number(cabDoc.totalFleet || cabDoc.quantityAvailable || 1);

  const queryDate = new Date(eventDate);
  const startOfDay = new Date(queryDate.setHours(0,0,0,0));
  const endOfDay = new Date(queryDate.setHours(23,59,59,999));

  console.log(`startOfDay: ${startOfDay}`);
  console.log(`endOfDay: ${endOfDay}`);

  const overlappingBookings = await Booking.find({
    eventDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed', 'in_progress', 'on_the_way'] },
    bookingType: { $in: ['cab', 'baraat-cab'] },
    $or: [
      { "fleetSelection.cabId": cabDoc._id },
      { "cabIds": cabDoc._id },
      { "cab": cabDoc._id }
    ]
  });

  console.log(`overlappingBookings length: ${overlappingBookings.length}`);

  let totalBooked = 0;
  for (const b of overlappingBookings) {
    if (b.fleetSelection && b.fleetSelection.length > 0) {
      const match = b.fleetSelection.find(f => f.cabId && f.cabId.toString() === cabDoc._id.toString());
      if (match) totalBooked += (match.count || 1);
    } else if (b.vehicles && b.vehicles.length > 0) {
      const idx = b.cabIds?.findIndex(id => id.toString() === cabDoc._id.toString());
      if (idx !== -1 && b.vehicles[idx]) {
        totalBooked += (b.vehicles[idx].count || 1);
      } else {
        totalBooked += 1;
      }
    } else {
      totalBooked += 1;
    }
  }

  const availableQty = maxFleetSize - totalBooked;
  
  console.log(`maxFleetSize: ${maxFleetSize}`);
  console.log(`totalBooked: ${totalBooked}`);
  console.log(`availableQty: ${availableQty}`);
  console.log(`requestedQty: ${requestedQty}`);

  if (requestedQty > availableQty) {
    console.log(`❌ FAILED: This vehicle is unavailable`);
  } else {
    console.log(`✅ SUCCESS: Vehicle is available`);
  }

  process.exit(0);
}
test();
