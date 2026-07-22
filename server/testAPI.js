require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Database connection diagnostics starting...');
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI is not set in the server environment configuration!');
  process.exit(1);
}

console.log('📡 Attempting connection to MongoDB Atlas...');
console.log(`🔗 Target URL: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`); // Redact password in logs

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ SUCCESS: Successfully connected to MongoDB Atlas!');
  console.log('🗄️ Connected Database:', mongoose.connection.name);
  console.log('🔌 Connection Host:', mongoose.connection.host);
  return mongoose.connection.close();
})
.then(() => {
  console.log('🔌 Connection closed cleanly.');
  process.exit(0);
})
.catch(err => {
  console.error('❌ CONNECTION ERROR: Failed to connect to MongoDB Atlas!');
  console.error('📁 Error Details:', err.message);
  process.exit(1);
});
