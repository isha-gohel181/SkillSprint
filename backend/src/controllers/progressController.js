const Progress = require("../models/Progress");
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const { validateProgress } = require("../utils/validators");
const {
  getStartOfDay,
  getEndOfDay,
  addDays,
  daysBetween,
} = require("../utils/dateUtils");

// Get user's overall progress
const getUserProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { period = "30" } = req.query; // days to look back

    const startDate = addDays(new Date(), -parseInt(period));
    const endDate = new Date();

    // Get progress data for the period
    const progressData = await Progress.find({
      userId,
      date: {
        $gte: getStartOfDay(startDate),
        $lte: getEndOfDay(endDate),
      },
    })
      .populate("goalId", "title category")
      .sort({ date: -1 });

    // Calculate overall statistics
    const stats = {
      totalTimeSpent: progressData.reduce((sum, p) => sum + p.timeSpent, 0),
      totalTasksCompleted: progressData.reduce(
        (sum, p) => sum + p.tasksCompleted,
        0
      ),
      totalDaysActive: new Set(progressData.map((p) => p.date.toDateString()))
        .size,
      currentStreak: 0,
      longestStreak: 0,
      averageTasksPerDay: 0,
      averageTimePerDay: 0,
    };

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(progressData);
    stats.currentStreak = currentStreak;
    stats.longestStreak = longestStreak;

    // Calculate averages
    if (stats.totalDaysActive > 0) {
      stats.averageTasksPerDay = Math.round(
        stats.totalTasksCompleted / stats.totalDaysActive
      );
      stats.averageTimePerDay = Math.round(
        stats.totalTimeSpent / stats.totalDaysActive
      );
    }

    // Get progress by goal
    const progressByGoal = {};
    progressData.forEach((p) => {
      const goalId = p.goalId._id.toString();
      if (!progressByGoal[goalId]) {
        progressByGoal[goalId] = {
          goal: p.goalId,
          totalTime: 0,
          totalTasks: 0,
          daysActive: new Set(),
        };
      }
      progressByGoal[goalId].totalTime += p.timeSpent;
      progressByGoal[goalId].totalTasks += p.tasksCompleted;
      progressByGoal[goalId].daysActive.add(p.date.toDateString());
    });

    // Convert daysActive Set to count
    Object.keys(progressByGoal).forEach((goalId) => {
      progressByGoal[goalId].daysActive =
        progressByGoal[goalId].daysActive.size;
    });

    res.json({
      success: true,
      data: {
        stats,
        progressByGoal: Object.values(progressByGoal),
        dailyProgress: progressData,
        period: parseInt(period),
      },
    });
  } catch (error) {
    console.error("Error getting user progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get progress data",
    });
  }
};

// Get progress for specific goal
const getGoalProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.params;
    const { period = "30" } = req.query;

    // Verify goal ownership
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    const startDate = addDays(new Date(), -parseInt(period));
    const endDate = new Date();

    const progressData = await Progress.find({
      userId,
      goalId,
      date: {
        $gte: getStartOfDay(startDate),
        $lte: getEndOfDay(endDate),
      },
    }).sort({ date: 1 });

    // Calculate goal-specific statistics
    const totalTasks = await Task.countDocuments({ goalId, userId });
    const completedTasks = await Task.countDocuments({
      goalId,
      userId,
      completed: true,
    });
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const stats = {
      completionPercentage,
      totalTasks,
      completedTasks,
      totalTimeSpent: progressData.reduce((sum, p) => sum + p.timeSpent, 0),
      totalTasksCompleted: progressData.reduce(
        (sum, p) => sum + p.tasksCompleted,
        0
      ),
      daysActive: new Set(progressData.map((p) => p.date.toDateString())).size,
      currentStreak:
        progressData.length > 0
          ? progressData[progressData.length - 1].streak
          : 0,
    };

    // Generate daily breakdown
    const dailyBreakdown = [];
    for (let i = 0; i < parseInt(period); i++) {
      const date = addDays(startDate, i);
      const dayProgress = progressData.find(
        (p) => p.date.toDateString() === date.toDateString()
      );

      dailyBreakdown.push({
        date: date.toISOString().split("T")[0],
        tasksCompleted: dayProgress ? dayProgress.tasksCompleted : 0,
        timeSpent: dayProgress ? dayProgress.timeSpent : 0,
        notes: dayProgress ? dayProgress.notes : "",
        streak: dayProgress ? dayProgress.streak : 0,
      });
    }

    res.json({
      success: true,
      data: {
        goal,
        stats,
        dailyBreakdown,
        progressData,
      },
    });
  } catch (error) {
    console.error("Error getting goal progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get goal progress",
    });
  }
};

// Log daily progress
const logProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId, date, tasksCompleted, totalTasks, timeSpent, notes } =
      req.body;

    // Validate input
    const validationErrors = validateProgress(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors,
      });
    }

    // Verify goal ownership
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    const progressDate = date ? new Date(date) : new Date();
    const startOfDay = getStartOfDay(progressDate);
    const endOfDay = getEndOfDay(progressDate);

    // Check if progress already exists for this day
    let progress = await Progress.findOne({
      userId,
      goalId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (progress) {
      // Update existing progress
      progress.tasksCompleted = tasksCompleted;
      progress.totalTasks = totalTasks;
      progress.timeSpent = timeSpent;
      progress.notes = notes || progress.notes;
    } else {
      // Create new progress entry
      progress = new Progress({
        userId,
        goalId,
        date: startOfDay,
        tasksCompleted,
        totalTasks,
        timeSpent,
        notes,
      });
    }

    await progress.save();

    // Recalculate streak
    const streak = await calculateCurrentStreak(userId, goalId);
    progress.streak = streak;
    await progress.save();

    res.json({
      success: true,
      data: { progress },
      message: "Progress logged successfully",
    });
  } catch (error) {
    console.error("Error logging progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to log progress",
    });
  }
};

// Get statistics and insights
const getStats = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Get all-time statistics
    const allProgress = await Progress.find({ userId });
    const allGoals = await Goal.find({ userId });
    const allTasks = await Task.find({ userId });

    const totalStats = {
      totalGoals: allGoals.length,
      activeGoals: allGoals.filter((g) => g.status === "Active").length,
      completedGoals: allGoals.filter((g) => g.status === "Completed").length,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter((t) => t.completed).length,
      totalTimeSpent: allProgress.reduce((sum, p) => sum + p.timeSpent, 0),
      totalDaysActive: new Set(allProgress.map((p) => p.date.toDateString()))
        .size,
    };

    // Calculate completion rate
    totalStats.taskCompletionRate =
      totalStats.totalTasks > 0
        ? Math.round((totalStats.completedTasks / totalStats.totalTasks) * 100)
        : 0;

    // Get category breakdown
    const categoryStats = {};
    allGoals.forEach((goal) => {
      if (!categoryStats[goal.category]) {
        categoryStats[goal.category] = {
          totalGoals: 0,
          completedGoals: 0,
          totalTasks: 0,
          completedTasks: 0,
        };
      }
      categoryStats[goal.category].totalGoals++;
      if (goal.status === "Completed") {
        categoryStats[goal.category].completedGoals++;
      }
    });

    // Add task data to category stats
    for (const category in categoryStats) {
      const categoryGoals = allGoals.filter((g) => g.category === category);
      const categoryGoalIds = categoryGoals.map((g) => g._id);
      const categoryTasks = allTasks.filter((t) =>
        categoryGoalIds.includes(t.goalId)
      );

      categoryStats[category].totalTasks = categoryTasks.length;
      categoryStats[category].completedTasks = categoryTasks.filter(
        (t) => t.completed
      ).length;
    }

    // Get recent achievements (completed goals and milestones)
    const recentGoals = await Goal.find({
      userId,
      status: "Completed",
      updatedAt: { $gte: addDays(new Date(), -30) },
    })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentAchievements = recentGoals.map((goal) => ({
      type: "goal",
      title: `Completed "${goal.title}"`,
      date: goal.updatedAt,
      category: goal.category,
    }));

    res.json({
      success: true,
      data: {
        totalStats,
        categoryStats,
        recentAchievements,
      },
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get statistics",
    });
  }
};

// Helper functions
const calculateStreaks = (progressData) => {
  if (progressData.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date ascending
  const sortedData = progressData.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i].tasksCompleted > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak (from today backwards)
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = addDays(today, -i);
    const dayProgress = progressData.find(
      (p) => p.date.toDateString() === checkDate.toDateString()
    );

    if (dayProgress && dayProgress.tasksCompleted > 0) {
      currentStreak++;
    } else if (i === 0) {
      // If today has no progress, check yesterday
      continue;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
};

const calculateCurrentStreak = async (userId, goalId) => {
  const progressData = await Progress.find({
    userId,
    goalId,
    date: { $gte: addDays(new Date(), -365) },
  }).sort({ date: -1 });

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = addDays(today, -i);
    const dayProgress = progressData.find(
      (p) => p.date.toDateString() === checkDate.toDateString()
    );

    if (dayProgress && dayProgress.tasksCompleted > 0) {
      streak++;
    } else if (i === 0) {
      // If today has no progress, check yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
};

module.exports = {
  getUserProgress,
  getGoalProgress,
  logProgress,
  getStats,
};
