const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Package } = require('./models/index');
const { seedPackagesIfEmpty } = require('./controllers/packageController');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('DB Connected. Dropping old packages...');
  await Package.deleteMany({});
  console.log('Packages dropped. Seeding new schema packages...');
  await seedPackagesIfEmpty();
  console.log('Done.');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
