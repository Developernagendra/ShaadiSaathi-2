require('dotenv').config({ path: '/Users/nagendrakumarsharma/Desktop/Ravi/server/.env' });
const mongoose = require('mongoose');
const User = require('/Users/nagendrakumarsharma/Desktop/Ravi/server/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find a user that is not verified
  const user = await User.findOne({ isVerified: false });
  if (!user) {
    console.log('No unverified users found');
    process.exit(0);
  }

  console.log('Found user:', user.email, 'isVerified:', user.isVerified);
  
  // Set to true
  user.isVerified = true;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  // Re-fetch
  const refetched = await User.findById(user._id);
  console.log('Refetched user isVerified:', refetched.isVerified);
  
  process.exit(0);
}
test();
