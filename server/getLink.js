const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });
const User = require('./models/User');

const getVerificationLink = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'n4narendrakr@gmail.com'; // The email the user just registered with
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User ${email} not found in database.`);
      process.exit(1);
    }

    if (user.isVerified) {
      console.log(`✅ User ${email} is already verified!`);
      process.exit(0);
    }

    // Generate a fresh token just in case
    const token = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = (process.env.CLIENT_URL || 'https://shaadi-saathi.vercel.app').replace(/\/$/, '');

    const verificationUrl = `${clientUrl}/verify-email/${token}`;

    console.log('\n======================================================');
    console.log('🚨 GMAIL IS HIDING YOUR EMAIL (Because you sent it to yourself)');
    console.log('======================================================');
    console.log('Since you registered using the SAME email address that your SMTP');
    console.log('server uses (n4narendrakr@gmail.com), Gmail thinks it is a "Sent"');
    console.log('message and skips your Inbox entirely.\n');
    console.log('👉 Check your "Sent" folder, "Spam" folder, or "All Mail".\n');
    console.log('To verify immediately, just click this link:');
    console.log('\n➡️  ' + verificationUrl + '\n');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

getVerificationLink();
