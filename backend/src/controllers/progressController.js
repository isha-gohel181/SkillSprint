const Progress = require('../models/Progress');
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const { isValidObjectId } = require('../utils/validators');
const { getStartOfToday, getEndOfToday, getWeekStart, getMonthStart } = require('../utils/dateUtils');

/**
 * Progress Controller - Handles progress logging and analytics
 */

/**
 * Log progress for a goal/task
 */
const logProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId, taskId, timeSpent, description, date, type, mood, difficulty, rating, notes, achievements, challenges, skillsLearned } = req.body;

    // Verify goal exists and belongs to user
    if (!isValidObjectId(goalId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID format',
        code: 'INVALID_GOAL_ID',
      });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND',
      });
    }

    // Verify task if provided
    if (taskId) {
      if (!isValidObjectId(taskId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid task ID format',
          code: 'INVALID_TASK_ID',
        });
      }

      const task = await Task.findOne({ _id: taskId, userId, goalId });
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
          code: 'TASK_NOT_FOUND',
        });
      }
    }

    const progressData = {
      userId,
      goalId,
      taskId,
      timeSpent,
      description,
      date: date ? new Date(date) : new Date(),
      type,
      mood,
      difficulty,
      rating,
      notes,
      achievements,
      challenges,
      skillsLearned,
    };

    const progress = new Progress(progressData);
    await progress.save();

    // Update goal's actual time spent
    await Goal.findByIdAndUpdate(
      goalId,
      { $inc: { actualTimeSpent: timeSpent } }
    );

    // Populate goal and task info for response
    await progress.populate([
      { path: 'goalId', select: 'title category difficulty' },
      { path: 'taskId', select: 'title priority' }
    ]);

    res.status(201).json({
      success: true,
      data: { progress },
      message: 'Progress logged successfully',
    });
  } catch (error) {
    console.error('Error logging progress:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to log progress',
      code: 'LOG_PROGRESS_ERROR',
    });
  }
};

/**
 * Get all progress entries for user
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { 
      goalId,
      startDate,
      endDate,
      type,
      page = 1, 
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId };
    if (goalId && isValidObjectId(goalId)) query.goalId = goalId;
    if (type) query.type = type;
    
    // Handle date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get progress entries with pagination
    const progressEntries = await Progress.find(query)
      .populate('goalId', 'title category difficulty')
      .populate('taskId', 'title priority')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Progress.countDocuments(query);

    res.json({
      success: true,
      data: {
        progress: progressEntries,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + progressEntries.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
      message: 'Progress entries retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
      code: 'FETCH_PROGRESS_ERROR',
    });
  }
};

/**
 * Get daily progress for user
 */
const getDailyProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { date } = req.query; // Optional date parameter (YYYY-MM-DD)

    const targetDate = date ? new Date(date) : new Date();
    const progressEntries = await Progress.getDailyProgressForUser(userId, targetDate);

    // Calculate daily summary
    const dailySummary = {
      date: targetDate.toISOString().split('T')[0],
      totalTime: progressEntries.reduce((sum, entry) => sum + entry.timeSpent, 0),
      entriesCount: progressEntries.length,
      averageRating: progressEntries.length > 0 
        ? Math.round(progressEntries.reduce((sum, entry) => sum + entry.rating, 0) / progressEntries.length * 10) / 10
        : 0,
      goalsWorkedOn: [...new Set(progressEntries.map(entry => entry.goalId._id.toString()))].length,
    };

    res.json({
      success: true,
      data: {
        progress: progressEntries,
        summary: dailySummary,
      },
      message: 'Daily progress retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching daily progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily progress',
      code: 'FETCH_DAILY_PROGRESS_ERROR',
    });
  }
};

/**
 * Get weekly progress for user
 */
const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { startDate } = req.query;

    const weekStart = startDate ? new Date(startDate) : getWeekStart();
    const progressEntries = await Progress.getWeeklyProgressForUser(userId, weekStart);

    // Group by day
    const dailyProgress = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyProgress[dateStr] = {
        date: dateStr,
        entries: [],
        totalTime: 0,
        entriesCount: 0,
      };
    }

    progressEntries.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0];
      if (dailyProgress[dateStr]) {
        dailyProgress[dateStr].entries.push(entry);
        dailyProgress[dateStr].totalTime += entry.timeSpent;
        dailyProgress[dateStr].entriesCount++;
      }
    });

    // Calculate weekly summary
    const weeklySummary = {
      weekStart: weekStart.toISOString().split('T')[0],
      totalTime: progressEntries.reduce((sum, entry) => sum + entry.timeSpent, 0),
      entriesCount: progressEntries.length,
      averageRating: progressEntries.length > 0 
        ? Math.round(progressEntries.reduce((sum, entry) => sum + entry.rating, 0) / progressEntries.length * 10) / 10
        : 0,
      goalsWorkedOn: [...new Set(progressEntries.map(entry => entry.goalId._id.toString()))].length,
      activeDays: Object.values(dailyProgress).filter(day => day.entriesCount > 0).length,
    };

    res.json({
      success: true,
      data: {
        dailyProgress: Object.values(dailyProgress),
        summary: weeklySummary,
      },
      message: 'Weekly progress retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly progress',
      code: 'FETCH_WEEKLY_PROGRESS_ERROR',
    });
  }
};

/**
 * Get monthly progress for user
 */
const getMonthlyProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { year, month } = req.query;

    const progressEntries = await Progress.getMonthlyProgressForUser(userId, year, month);

    // Group by date
    const dailyProgress = {};
    progressEntries.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0];
      if (!dailyProgress[dateStr]) {
        dailyProgress[dateStr] = {
          date: dateStr,
          entries: [],
          totalTime: 0,
          entriesCount: 0,
        };
      }
      dailyProgress[dateStr].entries.push(entry);
      dailyProgress[dateStr].totalTime += entry.timeSpent;
      dailyProgress[dateStr].entriesCount++;
    });

    // Calculate monthly summary
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month !== null ? month : now.getMonth();
    
    const monthlySummary = {
      year: targetYear,
      month: targetMonth,
      totalTime: progressEntries.reduce((sum, entry) => sum + entry.timeSpent, 0),
      entriesCount: progressEntries.length,
      averageRating: progressEntries.length > 0 
        ? Math.round(progressEntries.reduce((sum, entry) => sum + entry.rating, 0) / progressEntries.length * 10) / 10
        : 0,
      goalsWorkedOn: [...new Set(progressEntries.map(entry => entry.goalId._id.toString()))].length,
      activeDays: Object.keys(dailyProgress).length,
    };

    res.json({
      success: true,
      data: {
        dailyProgress: Object.values(dailyProgress).sort((a, b) => a.date.localeCompare(b.date)),
        summary: monthlySummary,
      },
      message: 'Monthly progress retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching monthly progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monthly progress',
      code: 'FETCH_MONTHLY_PROGRESS_ERROR',
    });
  }
};

/**
 * Get user's learning streak
 */
const getStreak = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const streakData = await Progress.getStreakForUser(userId);

    res.json({
      success: true,
      data: { streak: streakData },
      message: 'Streak data retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch streak data',
      code: 'FETCH_STREAK_ERROR',
    });
  }
};

/**
 * Get progress analytics
 */
const getAnalytics = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { days = 30, goalId } = req.query;

    const analytics = await Progress.getAnalyticsForUser(userId, parseInt(days));

    // Get goal-specific analytics if goalId provided
    let goalAnalytics = null;
    if (goalId && isValidObjectId(goalId)) {
      const goalProgress = await Progress.find({
        userId,
        goalId,
        date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      });

      goalAnalytics = {
        totalTime: goalProgress.reduce((sum, entry) => sum + entry.timeSpent, 0),
        entriesCount: goalProgress.length,
        averageRating: goalProgress.length > 0 
          ? Math.round(goalProgress.reduce((sum, entry) => sum + entry.rating, 0) / goalProgress.length * 10) / 10
          : 0,
      };
    }

    res.json({
      success: true,
      data: {
        analytics,
        goalAnalytics,
        period: `${days} days`,
      },
      message: 'Progress analytics retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      code: 'FETCH_ANALYTICS_ERROR',
    });
  }
};

/**
 * Update progress entry
 */
const updateProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid progress ID format',
        code: 'INVALID_ID',
      });
    }

    const progress = await Progress.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body },
      { new: true, runValidators: true }
    ).populate([
      { path: 'goalId', select: 'title category difficulty' },
      { path: 'taskId', select: 'title priority' }
    ]);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress entry not found',
        code: 'PROGRESS_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { progress },
      message: 'Progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update progress',
      code: 'UPDATE_PROGRESS_ERROR',
    });
  }
};

/**
 * Delete progress entry (soft delete)
 */
const deleteProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid progress ID format',
        code: 'INVALID_ID',
      });
    }

    const progress = await Progress.findOneAndUpdate(
      { _id: id, userId },
      { isDeleted: true },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress entry not found',
        code: 'PROGRESS_NOT_FOUND',
      });
    }

    // Update goal's actual time spent (subtract the deleted time)
    await Goal.findByIdAndUpdate(
      progress.goalId,
      { $inc: { actualTimeSpent: -progress.timeSpent } }
    );

    res.json({
      success: true,
      data: { progressId: id },
      message: 'Progress entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete progress entry',
      code: 'DELETE_PROGRESS_ERROR',
    });
  }
};

module.exports = {
  logProgress,
  getProgress,
  getDailyProgress,
  getWeeklyProgress,
  getMonthlyProgress,
  getStreak,
  getAnalytics,
  updateProgress,
  deleteProgress,
};