const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Morning, Afternoon, Evening, Full Day, or custom
  startTime: String,
  endTime: String,
  maxBookings: { type: Number, default: 1 },
  bookedCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'partially_booked', 'blocked'], 
    default: 'available' 
  }
});

const availabilitySchema = new mongoose.Schema({
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vendor', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'partially_booked', 'blocked'], 
    default: 'available' 
  },
  maxBookings: { type: Number, default: 1 },
  bookedCount: { type: Number, default: 0 },
  slots: [slotSchema],
  isBlocked: { type: Boolean, default: false },
  blockReason: String
}, { timestamps: true });

// Ensure unique availability record per vendor per date
availabilitySchema.index({ vendorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
