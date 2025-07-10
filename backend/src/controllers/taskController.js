const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Progress = require('../models/Progress');
const { isValidObjectId } = require('../utils/validators');
const { getStartOfToday, getEndOfToday, getDaysFromNow } = require('../utils/dateUtils');

/**
 * Task Controller - Handles task management and completion tracking
 */

/**
 * Get all tasks for the authenticated user
 */
const getTasks = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { 
      goalId,
      status, 
      priority,
      dueDate,
      scheduledFor,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId };
    if (goalId && isValidObjectId(goalId)) query.goalId = goalId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Handle date filters
    if (dueDate === 'today') {
      query.dueDate = { $gte: getStartOfToday(), $lte: getEndOfToday() };
    } else if (dueDate === 'overdue') {
      query.dueDate = { $lt: new Date() };
      query.status = { $in: ['pending', 'in-progress'] };
    } else if (dueDate === 'upcoming') {
      query.dueDate = { $gte: new Date(), $lte: getDaysFromNow(7) };
    }

    if (scheduledFor === 'today') {
      query.scheduledFor = { $gte: getStartOfToday(), $lte: getEndOfToday() };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get tasks with pagination and populate goal info
    const tasks = await Task.find(query)
      .populate('goalId', 'title category difficulty')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + tasks.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
      message: 'Tasks retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      code: 'FETCH_TASKS_ERROR',
    });
  }
};

/**
 * Get a specific task by ID
 */
const getTaskById = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
        code: 'INVALID_ID',
      });
    }

    const task = await Task.findOne({ _id: id, userId })
      .populate('goalId', 'title category difficulty');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        code: 'TASK_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { task },
      message: 'Task retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      code: 'FETCH_TASK_ERROR',
    });
  }
};

/**
 * Create a new task
 */
const createTask = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.body;

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

    const taskData = {
      ...req.body,
      userId,
    };

    const task = new Task(taskData);
    await task.save();

    // Populate goal info for response
    await task.populate('goalId', 'title category difficulty');

    res.status(201).json({
      success: true,
      data: { task },
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
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
      error: 'Failed to create task',
      code: 'CREATE_TASK_ERROR',
    });
  }
};

/**
 * Update a task
 */
const updateTask = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
        code: 'INVALID_ID',
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('goalId', 'title category difficulty');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        code: 'TASK_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { task },
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    
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
      error: 'Failed to update task',
      code: 'UPDATE_TASK_ERROR',
    });
  }
};

/**
 * Complete a task
 */
const completeTask = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { timeSpent, notes } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
        code: 'INVALID_ID',
      });
    }

    const task = await Task.findOne({ _id: id, userId })
      .populate('goalId', 'title category difficulty');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        code: 'TASK_NOT_FOUND',
      });
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Task is already completed',
        code: 'TASK_ALREADY_COMPLETED',
      });
    }

    // Mark task as completed
    await task.markCompleted(timeSpent);

    // Log progress if time spent is provided
    if (timeSpent && timeSpent > 0) {
      const progressData = {
        userId,
        goalId: task.goalId._id,
        taskId: task._id,
        timeSpent,
        description: notes || `Completed task: ${task.title}`,
        type: 'practice',
      };

      const progress = new Progress(progressData);
      await progress.save();

      // Update goal's actual time spent
      await Goal.findByIdAndUpdate(
        task.goalId._id,
        { $inc: { actualTimeSpent: timeSpent } }
      );
    }

    res.json({
      success: true,
      data: { task },
      message: 'Task completed successfully',
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete task',
      code: 'COMPLETE_TASK_ERROR',
    });
  }
};

/**
 * Delete a task (soft delete)
 */
const deleteTask = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
        code: 'INVALID_ID',
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { isDeleted: true },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        code: 'TASK_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { taskId: id },
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      code: 'DELETE_TASK_ERROR',
    });
  }
};

/**
 * Get daily tasks (due today or scheduled for today)
 */
const getDailyTasks = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { date } = req.query; // Optional date parameter (YYYY-MM-DD)

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get tasks due today or scheduled for today
    const tasks = await Task.find({
      userId,
      status: { $in: ['pending', 'in-progress'] },
      $or: [
        { dueDate: { $gte: startOfDay, $lte: endOfDay } },
        { scheduledFor: { $gte: startOfDay, $lte: endOfDay } },
      ],
    })
    .populate('goalId', 'title category difficulty')
    .sort({ priority: -1, dueDate: 1 });

    res.json({
      success: true,
      data: { tasks, date: targetDate.toISOString().split('T')[0] },
      message: 'Daily tasks retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily tasks',
      code: 'FETCH_DAILY_TASKS_ERROR',
    });
  }
};

/**
 * Get overdue tasks
 */
const getOverdueTasks = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const tasks = await Task.getOverdueForUser(userId);

    res.json({
      success: true,
      data: { tasks },
      message: 'Overdue tasks retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue tasks',
      code: 'FETCH_OVERDUE_TASKS_ERROR',
    });
  }
};

/**
 * Get tasks by priority
 */
const getTasksByPriority = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { priority } = req.params;

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority level',
        code: 'INVALID_PRIORITY',
      });
    }

    const tasks = await Task.getByPriorityForUser(userId, priority);

    res.json({
      success: true,
      data: { tasks, priority },
      message: `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority tasks retrieved successfully`,
    });
  } catch (error) {
    console.error('Error fetching tasks by priority:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks by priority',
      code: 'FETCH_PRIORITY_TASKS_ERROR',
    });
  }
};

/**
 * Schedule a task for a specific date
 */
const scheduleTask = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { scheduledFor } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format',
        code: 'INVALID_ID',
      });
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot schedule task for past date',
        code: 'INVALID_SCHEDULE_DATE',
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { scheduledFor: scheduledDate },
      { new: true, runValidators: true }
    ).populate('goalId', 'title category difficulty');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        code: 'TASK_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { task },
      message: 'Task scheduled successfully',
    });
  } catch (error) {
    console.error('Error scheduling task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule task',
      code: 'SCHEDULE_TASK_ERROR',
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getDailyTasks,
  getOverdueTasks,
  getTasksByPriority,
  scheduleTask,
};