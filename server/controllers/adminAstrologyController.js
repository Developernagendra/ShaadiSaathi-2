const catchAsync = require('../utils/catchAsync');
const ToolAnalytics = require('../models/ToolAnalytics');
const { SavedKundli, SavedMuhurat } = require('../models/ToolModels');

exports.getAstrologyAnalytics = catchAsync(async (req, res) => {
  // Aggregate Kundli Matches
  const totalKundlis = await ToolAnalytics.countDocuments({ toolName: 'Kundli Matching' });
  const totalMuhurats = await ToolAnalytics.countDocuments({ toolName: 'Shubh Muhurat Finder' });
  
  // Language Distribution
  const languageDist = await ToolAnalytics.aggregate([
    { $match: { toolName: { $in: ['Kundli Matching', 'Shubh Muhurat Finder'] } } },
    { $group: { _id: '$language', count: { $sum: 1 } } }
  ]);

  // State/City Distribution (using the 'state' field from ToolAnalytics)
  const stateDist = await ToolAnalytics.aggregate([
    { $match: { toolName: { $in: ['Kundli Matching', 'Shubh Muhurat Finder'] }, state: { $ne: '' } } },
    { $group: { _id: '$state', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Recent saved reports
  const recentKundlis = await SavedKundli.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
  const recentMuhurats = await SavedMuhurat.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

  res.status(200).json({
    success: true,
    data: {
      totalSearches: totalKundlis + totalMuhurats,
      totalKundlis,
      totalMuhurats,
      languageDistribution: languageDist.map(l => ({ language: l._id || 'en', count: l.count })),
      stateDistribution: stateDist.map(s => ({ state: s._id, count: s.count })),
      recentSavedKundlis: recentKundlis,
      recentSavedMuhurats: recentMuhurats
    }
  });
});
