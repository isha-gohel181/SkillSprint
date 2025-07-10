const Goal = require('../models/Goal');
const Task = require('../models/Task');
const geminiService = require('../services/geminiService');
const { isValidObjectId } = require('../utils/validators');

/**
 * Goal Controller - Handles CRUD operations for goals and milestone management
 */

/**
 * Get all goals for the authenticated user
 */
const getGoals = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { 
      status, 
      category, 
      difficulty,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId };
    if (status) query.status = status;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get goals with pagination
    const goals = await Goal.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Goal.countDocuments(query);

    res.json({
      success: true,
      data: {
        goals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + goals.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
      message: 'Goals retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals',
      code: 'FETCH_GOALS_ERROR',
    });
  }
};

/**
 * Get a specific goal by ID
 */
const getGoalById = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID format',
        code: 'INVALID_ID',
      });
    }

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { goal },
      message: 'Goal retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal',
      code: 'FETCH_GOAL_ERROR',
    });
  }
};

/**
 * Create a new goal
 */
const createGoal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const goalData = {
      ...req.body,
      userId,
    };

    const goal = new Goal(goalData);
    await goal.save();

    res.status(201).json({
      success: true,
      data: { goal },
      message: 'Goal created successfully',
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    
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
      error: 'Failed to create goal',
      code: 'CREATE_GOAL_ERROR',
    });
  }
};

/**
 * Create a goal with AI-generated breakdown
 */
const createGoalWithAI = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { title, description, difficulty, timeframe } = req.body;

    // Generate goal breakdown using AI
    const aiBreakdown = await geminiService.generateGoalBreakdown({
      title,
      description,
      difficulty,
      timeframe,
    });

    // Create goal with AI-generated milestones
    const goalData = {
      userId,
      title,
      description,
      difficulty,
      category: req.body.category || 'other',
      milestones: aiBreakdown.milestones || [],
      isAiGenerated: true,
      aiGenerationData: {
        prompt: `${title}: ${description}`,
        generatedAt: new Date(),
        model: 'gemini-pro',
      },
      totalEstimatedTime: aiBreakdown.recommendedDailyTime * (timeframe || 30),
    };

    const goal = new Goal(goalData);
    await goal.save();

    // Create tasks for the first milestone if available
    if (aiBreakdown.milestones && aiBreakdown.milestones.length > 0) {
      const firstMilestone = aiBreakdown.milestones[0];
      if (firstMilestone.tasks) {
        const tasks = firstMilestone.tasks.map(taskData => ({
          userId,
          goalId: goal._id,
          milestoneId: goal.milestones[0]._id,
          title: taskData.title,
          description: taskData.description,
          estimatedTime: taskData.estimatedTime,
          priority: taskData.priority || 'medium',
          resources: taskData.resources || [],
          isAiGenerated: true,
          aiGenerationData: {
            prompt: `${title}: ${description}`,
            generatedAt: new Date(),
            goalContext: title,
          },
        }));

        await Task.insertMany(tasks);
      }
    }

    res.status(201).json({
      success: true,
      data: { 
        goal,
        aiBreakdown: {
          totalEstimatedDays: aiBreakdown.totalEstimatedDays,
          recommendedDailyTime: aiBreakdown.recommendedDailyTime,
        },
      },
      message: 'Goal created with AI breakdown successfully',
    });
  } catch (error) {
    console.error('Error creating goal with AI:', error);
    
    if (error.message === 'Gemini AI service is not available') {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create goal with AI breakdown',
      code: 'CREATE_AI_GOAL_ERROR',
    });
  }
};

/**
 * Update a goal
 */
const updateGoal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID format',
        code: 'INVALID_ID',
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { goal },
      message: 'Goal updated successfully',
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    
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
      error: 'Failed to update goal',
      code: 'UPDATE_GOAL_ERROR',
    });
  }
};

/**
 * Delete a goal (soft delete)
 */
const deleteGoal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID format',
        code: 'INVALID_ID',
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { isDeleted: true },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND',
      });
    }

    // Also soft delete associated tasks
    await Task.updateMany(
      { goalId: id, userId },
      { isDeleted: true }
    );

    res.json({
      success: true,
      data: { goalId: id },
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal',
      code: 'DELETE_GOAL_ERROR',
    });
  }
};

/**
 * Complete a milestone
 */
const completeMilestone = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId, milestoneId } = req.params;

    if (!isValidObjectId(goalId) || !isValidObjectId(milestoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        code: 'INVALID_ID',
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

    await goal.completeMilestone(milestoneId);

    res.json({
      success: true,
      data: { goal },
      message: 'Milestone completed successfully',
    });
  } catch (error) {
    console.error('Error completing milestone:', error);
    
    if (error.message === 'Milestone not found') {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found',
        code: 'MILESTONE_NOT_FOUND',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to complete milestone',
      code: 'COMPLETE_MILESTONE_ERROR',
    });
  }
};

/**
 * Get goal analytics
 */
const getGoalAnalytics = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID format',
        code: 'INVALID_ID',
      });
    }

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
        code: 'GOAL_NOT_FOUND',
      });
    }

    // Get related tasks
    const tasks = await Task.find({ goalId: id, userId });
    const completedTasks = tasks.filter(task => task.status === 'completed');

    // Calculate analytics
    const analytics = {
      goalProgress: goal.progress,
      milestonesTotal: goal.milestones.length,
      milestonesCompleted: goal.milestones.filter(m => m.isCompleted).length,
      tasksTotal: tasks.length,
      tasksCompleted: completedTasks.length,
      totalEstimatedTime: goal.totalEstimatedTime,
      actualTimeSpent: goal.actualTimeSpent,
      estimatedCompletionDate: goal.getEstimatedCompletionDate(),
      averageTaskCompletion: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    };

    res.json({
      success: true,
      data: { analytics },
      message: 'Goal analytics retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching goal analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal analytics',
      code: 'FETCH_ANALYTICS_ERROR',
    });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  createGoalWithAI,
  updateGoal,
  deleteGoal,
  completeMilestone,
  getGoalAnalytics,
};