const Goal = require("../models/Goal");
const Task = require("../models/Task");
const Progress = require("../models/Progress");
const geminiService = require("../services/geminiService");
const { validateGoal } = require("../utils/validators");
const { addDays } = require("../utils/dateUtils");

// Create new goal with AI breakdown
const createGoal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const goalData = req.body;

    // Validate input
    const validationErrors = validateGoal(goalData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors,
      });
    }

    // Create goal
    const goal = new Goal({
      ...goalData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await goal.save();

    // Get AI breakdown
    try {
      const aiBreakdown = await geminiService.breakdownGoal(
        goalData.title,
        goalData.description,
        goalData.targetDuration,
        goalData.difficulty
      );

      // Update goal with milestones
      if (aiBreakdown.milestones) {
        goal.milestones = aiBreakdown.milestones;
        await goal.save();
      }

      // Create tasks from AI breakdown
      if (aiBreakdown.tasks) {
        const tasks = aiBreakdown.tasks.map((task, index) => ({
          ...task,
          goalId: goal._id,
          userId,
          dueDate: addDays(
            new Date(),
            Math.floor(
              index * (goalData.targetDuration / aiBreakdown.tasks.length)
            )
          ),
        }));

        await Task.insertMany(tasks);
      }
    } catch (aiError) {
      console.error("AI breakdown failed:", aiError);
      // Continue without AI breakdown
    }

    res.status(201).json({
      success: true,
      data: { goal },
      message: "Goal created successfully",
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create goal",
    });
  }
};

// Get user's goals
const getUserGoals = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { status, category, page = 1, limit = 10 } = req.query;

    const filter = { userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const totalTasks = await Task.countDocuments({ goalId: goal._id });
        const completedTasks = await Task.countDocuments({
          goalId: goal._id,
          completed: true,
        });

        const progress =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          ...goal.toObject(),
          progress: Math.round(progress),
          totalTasks,
          completedTasks,
        };
      })
    );

    const total = await Goal.countDocuments(filter);

    res.json({
      success: true,
      data: {
        goals: goalsWithProgress,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting goals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get goals",
    });
  }
};

// Get specific goal
const getGoal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    // Get associated tasks
    const tasks = await Task.find({ goalId: id }).sort({ dueDate: 1 });

    // Get progress data
    const progress = await Progress.find({ goalId: id }).sort({ date: -1 });

    res.json({
      success: true,
      data: {
        goal,
        tasks,
        progress,
      },
    });
  } catch (error) {
    console.error("Error getting goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get goal",
    });
  }
};

// Update goal
const updateGoal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.userId;
    delete updateData.createdAt;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    res.json({
      success: true,
      data: { goal },
      message: "Goal updated successfully",
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update goal",
    });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    // Delete associated tasks and progress
    await Task.deleteMany({ goalId: id });
    await Progress.deleteMany({ goalId: id });

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete goal",
    });
  }
};

// Complete milestone
const completeMilestone = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { milestoneIndex } = req.body;

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: "Goal not found",
      });
    }

    if (!goal.milestones[milestoneIndex]) {
      return res.status(400).json({
        success: false,
        error: "Invalid milestone index",
      });
    }

    goal.milestones[milestoneIndex].completed = true;
    goal.milestones[milestoneIndex].completedAt = new Date();
    goal.updatedAt = new Date();

    await goal.save();

    res.json({
      success: true,
      data: { goal },
      message: "Milestone completed successfully",
    });
  } catch (error) {
    console.error("Error completing milestone:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete milestone",
    });
  }
};

module.exports = {
  createGoal,
  getUserGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  completeMilestone,
};
