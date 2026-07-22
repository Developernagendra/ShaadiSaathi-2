const mongoose = require('mongoose');
require('dotenv').config();
const { Package } = require('./models/index');

async function updatePrices() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to DB');

    const updates = [
      { slug: 'silver', price: 60000 },
      { slug: 'gold', price: 94500 },
      { slug: 'royal', price: 195000 }
    ];

    for (const update of updates) {
      const pkg = await Package.findOne({ slug: update.slug });
      if (pkg) {
        pkg.price = update.price;
        // set discount to 0 to ensure finalPrice == price, or just let pre-save hook calculate it
        pkg.discount = 0; 
        await pkg.save();
        console.log(`Updated ${update.slug} to ${update.price}`);
      } else {
        console.log(`Package ${update.slug} not found`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Disconnected from DB');
  }
}

updatePrices();
