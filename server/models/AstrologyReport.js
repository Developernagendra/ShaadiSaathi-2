const mongoose = require('mongoose');

const astrologyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reportType: {
    type: String,
    enum: ['kundli', 'muhurat'],
    required: true
  },
  brideDetails: {
    name: String,
    dob: Date,
    timeOfBirth: String,
    placeOfBirth: String
  },
  groomDetails: {
    name: String,
    dob: Date,
    timeOfBirth: String,
    placeOfBirth: String
  },
  muhuratDetails: {
    location: String,
    startDate: Date,
    endDate: Date
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AstrologyReport', astrologyReportSchema);
