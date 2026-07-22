require('dotenv').config();
const mongoose = require('mongoose');
const { Category, Vendor, Service } = require('./models/index');

async function run() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected.');

  console.log('\n--- CATEGORIES IN DB ---');
  const categories = await Category.find();
  categories.forEach(c => {
    console.log(`- [${c._id}] name: "${c.name}", slug: "${c.slug}", icon: "${c.icon}"`);
  });

  console.log('\n--- VENDORS WITH MISSING OR NULL CATEGORY ---');
  const vendorsMissingCat = await Vendor.find({
    $or: [
      { category: null },
      { category: { $exists: false } }
    ]
  }).populate('user', 'name email');
  console.log(`Found ${vendorsMissingCat.length} vendors missing category:`);
  vendorsMissingCat.forEach(v => {
    console.log(`- [${v._id}] businessName: "${v.businessName}", email: "${v.email}", user: "${v.user?.name || 'N/A'}"`);
  });

  console.log('\n--- SERVICES WITH MISSING OR NULL CATEGORY ---');
  const servicesMissingCat = await Service.find({
    $or: [
      { category: null },
      { category: { $exists: false } }
    ]
  }).populate('vendor', 'businessName');
  console.log(`Found ${servicesMissingCat.length} services missing category:`);
  servicesMissingCat.forEach(s => {
    console.log(`- [${s._id}] title: "${s.title}", vendor: "${s.vendor?.businessName || 'N/A'}"`);
  });

  console.log('\n--- ALL VENDORS & THEIR CATEGORIES ---');
  const allVendors = await Vendor.find().populate('category', 'name').populate('user', 'name');
  allVendors.forEach(v => {
    console.log(`- [${v._id}] businessName: "${v.businessName}", category: "${v.category?.name || 'NULL/MISSING'}"`);
  });

  console.log('\n--- ALL SERVICES & THEIR CATEGORIES ---');
  const allServices = await Service.find().populate('category', 'name').populate('vendor', 'businessName');
  allServices.forEach(s => {
    console.log(`- [${s._id}] title: "${s.title}", vendor: "${s.vendor?.businessName || 'N/A'}", category: "${s.category?.name || 'NULL/MISSING'}"`);
  });

  await mongoose.connection.close();
  console.log('\n🔌 Connection closed.');
}

run().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
