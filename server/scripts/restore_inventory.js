require('dotenv').config();
const mongoose = require('mongoose');
const { Cab } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shaadisaathi';

const restoreInventory = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all cabs that have 0 or negative or missing totalFleet
    const affectedCabs = await Cab.find({
      $or: [
        { totalFleet: { $lte: 0 } },
        { totalFleet: { $exists: false } }
      ]
    });

    console.log(`Found ${affectedCabs.length} cabs with depleted or missing inventory.`);

    let updatedCount = 0;
    for (const cab of affectedCabs) {
      cab.totalFleet = 1; // Restore to baseline 1. Vendors can manually increase this from dashboard if they have more.
      await cab.save();
      updatedCount++;
    }

    console.log(`🎉 Successfully restored inventory for ${updatedCount} cabs!`);
  } catch (error) {
    console.error('❌ Error restoring inventory:', error);
  } finally {
    mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

restoreInventory();
