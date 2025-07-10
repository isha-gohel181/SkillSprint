const express = require("express");
const Task = require("../models/Task");
const Goal = require("../models/Goal");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/tasks - Get all tasks for the authenticated user
router.get("/", async (req, res) => {
  try {
    const { goalId, status, type, dueDate } = req.query;
    
    let filter = { userId: req.auth.userId };
    
    if (goalId) filter.goalId = goalId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      filter.dueDate = { $gte: date, $lt: nextDay };
    }

    const tasks = await Task.find(filter)
      .populate('goalId', 'title category')
      .sort({ dueDate: 1, priority: -1 });
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch tasks" 
    });
  }
});

// GET /api/tasks/today - Get today's tasks
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tasks = await Task.find({
      userId: req.auth.userId,
      dueDate: { $gte: today, $lt: tomorrow }
    })
    .populate('goalId', 'title category')
    .sort({ priority: -1, dueDate: 1 });
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching today's tasks:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch today's tasks" 
    });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.auth.userId
    }).populate('goalId', 'title category');

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: "Task not found" 
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch task" 
    });
  }
});

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.auth.userId,
    };

    // Verify the goal belongs to the user
    const goal = await Goal.findOne({
      _id: taskData.goalId,
      userId: req.auth.userId,
      isActive: true
    });

    if (!goal) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid goal ID" 
      });
    }

    const task = new Task(taskData);
    await task.save();
    
    await task.populate('goalId', 'title category');

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to create task" 
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.auth.userId
      },
      req.body,
      { new: true, runValidators: true }
    ).populate('goalId', 'title category');

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: "Task not found" 
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to update task" 
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.auth.userId
    });

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: "Task not found" 
      });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete task" 
    });
  }
});

// PATCH /api/tasks/:id/complete - Mark task as completed
router.patch("/:id/complete", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.auth.userId
      },
      { 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('goalId', 'title category');

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: "Task not found" 
      });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to complete task" 
    });
  }
});

module.exports = router;