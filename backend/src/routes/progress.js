const express = require("express");
const Progress = require("../models/Progress");
const Task = require("../models/Task");
const Goal = require("../models/Goal");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/progress - Get progress data for the authenticated user
router.get("/", async (req, res) => {
  try {
    const { goalId, startDate, endDate } = req.query;
    
    let filter = { userId: req.auth.userId };
    
    if (goalId) filter.goalId = goalId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const progress = await Progress.find(filter)
      .populate('goalId', 'title category')
      .sort({ date: -1 });
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch progress" 
    });
  }
});

// GET /api/progress/summary - Get progress summary for dashboard
router.get("/summary", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's progress
    const todayProgress = await Progress.findOne({
      userId,
      date: { $gte: today }
    });

    // Get current streak
    const recentProgress = await Progress.find({
      userId,
      tasksCompleted: { $gt: 0 }
    }).sort({ date: -1 }).limit(30);

    let currentStreak = 0;
    const progressDates = recentProgress.map(p => p.date.toDateString());
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (progressDates.includes(checkDate.toDateString())) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get total goals and completed goals
    const totalGoals = await Goal.countDocuments({
      userId,
      isActive: true
    });

    const completedGoals = await Goal.countDocuments({
      userId,
      status: 'completed',
      isActive: true
    });

    // Get total tasks for today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayTasks = await Task.find({
      userId,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    const completedTodayTasks = todayTasks.filter(task => task.status === 'completed').length;

    const summary = {
      todayTasksCompleted: completedTodayTasks,
      todayTotalTasks: todayTasks.length,
      currentStreak,
      totalGoals,
      completedGoals,
      timeSpentToday: todayProgress?.timeSpent || 0,
      achievements: todayProgress?.achievements || []
    };

    res.json({ success: true, summary });
  } catch (error) {
    console.error("Error fetching progress summary:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch progress summary" 
    });
  }
});

// GET /api/progress/chart/:goalId - Get chart data for a specific goal
router.get("/chart/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const progressData = await Progress.find({
      userId: req.auth.userId,
      goalId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const chartData = progressData.map(p => ({
      date: p.date.toISOString().split('T')[0],
      tasksCompleted: p.tasksCompleted,
      timeSpent: p.timeSpent,
      streak: p.streak
    }));

    res.json({ success: true, chartData });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch chart data" 
    });
  }
});

// POST /api/progress - Log progress for a goal
router.post("/", async (req, res) => {
  try {
    const progressData = {
      ...req.body,
      userId: req.auth.userId,
    };

    // Check if progress already exists for today and this goal
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let progress = await Progress.findOne({
      userId: req.auth.userId,
      goalId: progressData.goalId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (progress) {
      // Update existing progress
      Object.assign(progress, progressData);
      await progress.save();
    } else {
      // Create new progress entry
      progress = new Progress(progressData);
      await progress.save();
    }
    
    await progress.populate('goalId', 'title category');

    res.status(201).json({ success: true, progress });
  } catch (error) {
    console.error("Error logging progress:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to log progress" 
    });
  }
});

// PATCH /api/progress/task-completed - Update progress when a task is completed
router.patch("/task-completed", async (req, res) => {
  try {
    const { taskId, timeSpent = 0 } = req.body;
    
    // Get the task to find the goal
    const task = await Task.findOne({
      _id: taskId,
      userId: req.auth.userId
    });

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: "Task not found" 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find or create today's progress for this goal
    let progress = await Progress.findOne({
      userId: req.auth.userId,
      goalId: task.goalId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!progress) {
      progress = new Progress({
        userId: req.auth.userId,
        goalId: task.goalId,
        date: today,
        tasksCompleted: 0,
        totalTasks: 0,
        timeSpent: 0
      });
    }

    // Update progress
    progress.tasksCompleted += 1;
    progress.timeSpent += timeSpent;

    // Get total tasks for today for this goal
    const totalTodayTasks = await Task.countDocuments({
      userId: req.auth.userId,
      goalId: task.goalId,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    progress.totalTasks = totalTodayTasks;

    await progress.save();
    await progress.populate('goalId', 'title category');

    res.json({ success: true, progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to update progress" 
    });
  }
});

module.exports = router;