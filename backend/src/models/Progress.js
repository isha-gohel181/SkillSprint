const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: false,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    timeSpent: {
      type: Number, // in minutes
      required: true,
      min: 1,
      max: 1440, // max 24 hours
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    type: {
      type: String,
      enum: ['study', 'practice', 'project', 'review', 'other'],
      default: 'study',
    },
    mood: {
      type: String,
      enum: ['frustrated', 'neutral', 'good', 'excellent'],
      default: 'neutral',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    notes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    achievements: [{
      type: String,
      maxlength: 200,
      trim: true,
    }],
    challenges: [{
      type: String,
      maxlength: 200,
      trim: true,
    }],
    skillsLearned: [{
      type: String,
      maxlength: 100,
      trim: true,
    }],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
progressSchema.index({ userId: 1, date: -1 });
progressSchema.index({ userId: 1, goalId: 1, date: -1 });
progressSchema.index({ goalId: 1, date: -1 });

// Virtual to format date as YYYY-MM-DD
progressSchema.virtual('dateString').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Static method to get daily progress for a user
progressSchema.statics.getDailyProgressForUser = function(userId, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).populate('goalId', 'title category').populate('taskId', 'title');
};

// Static method to get weekly progress for a user
progressSchema.statics.getWeeklyProgressForUser = function(userId, startDate = null) {
  if (!startDate) {
    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    startDate = monday;
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  }).populate('goalId', 'title category').sort({ date: 1 });
};

// Static method to get monthly progress for a user
progressSchema.statics.getMonthlyProgressForUser = function(userId, year = null, month = null) {
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month !== null ? month : now.getMonth();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  return this.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).populate('goalId', 'title category').sort({ date: 1 });
};

// Static method to get progress streak for a user
progressSchema.statics.getStreakForUser = async function(userId) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  let currentDate = new Date(today);
  let streak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check progress for the last 365 days
  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayProgress = await this.findOne({
      userId,
      date: { $gte: dayStart, $lte: dayEnd },
    });

    if (dayProgress) {
      tempStreak++;
      if (i < 30) { // Only count current streak for recent days
        streak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i === 0) {
        // No progress today, check if yesterday had progress
        streak = 0;
      }
      tempStreak = 0;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return { currentStreak: streak, longestStreak };
};

// Static method to get total time spent by user
progressSchema.statics.getTotalTimeForUser = function(userId, goalId = null) {
  const query = { userId };
  if (goalId) {
    query.goalId = goalId;
  }

  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalTime: { $sum: '$timeSpent' },
        sessionCount: { $sum: 1 },
        avgTimePerSession: { $avg: '$timeSpent' },
      },
    },
  ]);
};

// Static method to get progress analytics for a user
progressSchema.statics.getAnalyticsForUser = async function(userId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const analytics = await this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
        },
        dailyTime: { $sum: '$timeSpent' },
        sessionCount: { $sum: 1 },
        avgMood: { $avg: { $cond: [
          { $in: ['$mood', ['frustrated', 'neutral', 'good', 'excellent']] },
          { $switch: {
            branches: [
              { case: { $eq: ['$mood', 'frustrated'] }, then: 1 },
              { case: { $eq: ['$mood', 'neutral'] }, then: 2 },
              { case: { $eq: ['$mood', 'good'] }, then: 3 },
              { case: { $eq: ['$mood', 'excellent'] }, then: 4 },
            ],
            default: 2
          }},
          2
        ]}},
        avgRating: { $avg: '$rating' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
    },
  ]);

  const totalStats = await this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalTime: { $sum: '$timeSpent' },
        totalSessions: { $sum: 1 },
        avgTimePerSession: { $avg: '$timeSpent' },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  return {
    daily: analytics,
    totals: totalStats[0] || {
      totalTime: 0,
      totalSessions: 0,
      avgTimePerSession: 0,
      avgRating: 0,
    },
  };
};

// Exclude deleted progress by default
progressSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Progress', progressSchema);