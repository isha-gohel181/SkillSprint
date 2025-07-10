const Task = require("../models/Task");
const Goal = require("../models/Goal");
const Progress = require("../models/Progress");
const { validateTask } = require("../utils/validators");
const { getStartOfDay, getEndOfDay, addDays } = require("../utils/dateUtils");

// Get user's tasks with filters
const getTasks = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const {
      goalId,
      completed,
      type,
      difficulty,
      date,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { userId };

    if (goalId) filter.goalId = goalId;
    if (completed !== undefined) filter.completed = completed === "true";
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    if (date) {
      const targetDate = new Date(date);
      filter.dueDate = {
        $gte: getStartOfDay(targetDate),
        $lte: getEndOfDay(targetDate),
      };
    }

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .populate("goalId", "title category")
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get tasks",
    });
  }
};

// Get specific task
const getTask = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId }).populate(
      "goalId",
      "title category difficulty"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error("Error getting task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get task",
    });
  }
};

// Complete task
const completeTask = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { timeSpent = 0, notes = "" } = req.body;

    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    if (task.completed) {
      return res.status(400).json({
        success: false,
        error: "Task already completed",
      });
    }

    // Mark task as completed
    task.completed = true;
    task.completedAt = new Date();
    task.updatedAt = new Date();
    await task.save();

    // Update or create progress entry for today
    const today = getStartOfDay();
    let progress = await Progress.findOne({
      userId,
      goalId: task.goalId,
      date: {
        $gte: today,
        $lte: getEndOfDay(),
      },
    });

    if (progress) {
      progress.tasksCompleted += 1;
      progress.timeSpent += timeSpent;
      if (notes) progress.notes = notes;
    } else {
      const totalTasks = await Task.countDocuments({
        goalId: task.goalId,
        dueDate: {
          $gte: today,
          $lte: getEndOfDay(),
        },
      });

      progress = new Progress({
        userId,
        goalId: task.goalId,
        date: today,
        tasksCompleted: 1,
        totalTasks,
        timeSpent,
        notes,
      });
    }

    await progress.save();

    // Calculate and update streak
    await updateStreak(userId, task.goalId);

    res.json({
      success: true,
      data: { task, progress },
      message: "Task completed successfully",
    });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete task",
    });
  }
};

// Get today's tasks
const getTodayTasks = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const today = getStartOfDay();
    const endOfDay = getEndOfDay();

    const tasks = await Task.find({
      userId,
      dueDate: {
        $gte: today,
        $lte: endOfDay,
      },
    })
      .populate("goalId", "title category")
      .sort({ completed: 1, dueDate: 1 });

    const summary = {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      totalTimeEstimated: tasks.reduce(
        (sum, task) => sum + task.estimatedTime,
        0
      ),
      timeSpentToday: 0, // Will be calculated from progress
    };

    // Get today's progress
    const todayProgress = await Progress.find({
      userId,
      date: {
        $gte: today,
        $lte: endOfDay,
      },
    });

    summary.timeSpentToday = todayProgress.reduce(
      (sum, p) => sum + p.timeSpent,
      0
    );

    res.json({
      success: true,
      data: {
        tasks,
        summary,
      },
    });
  } catch (error) {
    console.error("Error getting today tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get today tasks",
    });
  }
};

// Get upcoming tasks
const getUpcomingTasks = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { days = 7 } = req.query;

    const startDate = addDays(new Date(), 1); // Tomorrow
    const endDate = addDays(new Date(), parseInt(days));

    const tasks = await Task.find({
      userId,
      completed: false,
      dueDate: {
        $gte: getStartOfDay(startDate),
        $lte: getEndOfDay(endDate),
      },
    })
      .populate("goalId", "title category")
      .sort({ dueDate: 1 });

    // Group tasks by date
    const tasksByDate = {};
    tasks.forEach((task) => {
      const dateKey = task.dueDate.toISOString().split("T")[0];
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

    res.json({
      success: true,
      data: {
        tasks,
        tasksByDate,
        summary: {
          totalUpcoming: tasks.length,
          daysIncluded: parseInt(days),
        },
      },
    });
  } catch (error) {
    console.error("Error getting upcoming tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get upcoming tasks",
    });
  }
};

// Helper function to update streak
const updateStreak = async (userId, goalId) => {
  try {
    const progressRecords = await Progress.find({ userId, goalId })
      .sort({ date: -1 })
      .limit(30);

    let currentStreak = 0;
    const today = getStartOfDay();

    for (let i = 0; i < progressRecords.length; i++) {
      const progress = progressRecords[i];
      const expectedDate = addDays(today, -i);

      // Check if this progress is for the expected date and has completed tasks
      if (
        progress.date.toDateString() === expectedDate.toDateString() &&
        progress.tasksCompleted > 0
      ) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Update all today's progress records with the new streak
    await Progress.updateMany(
      {
        userId,
        goalId,
        date: {
          $gte: today,
          $lte: getEndOfDay(),
        },
      },
      { streak: currentStreak }
    );
  } catch (error) {
    console.error("Error updating streak:", error);
  }
};

module.exports = {
  getTasks,
  getTask,
  completeTask,
  getTodayTasks,
  getUpcomingTasks,
};
