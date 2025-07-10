const Quiz = require('../models/Quiz');
const Goal = require('../models/Goal');
const geminiService = require('../services/geminiService');
const { isValidObjectId } = require('../utils/validators');

/**
 * AI Controller - Handles Gemini AI integration for goal breakdown and quiz generation
 */

/**
 * Generate goal breakdown using AI
 */
const generateGoalBreakdown = async (req, res) => {
  try {
    const { title, description, difficulty, timeframe = 30 } = req.body;

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    }

    const breakdown = await geminiService.generateGoalBreakdown({
      title,
      description,
      difficulty,
      timeframe,
    });

    res.json({
      success: true,
      data: { breakdown },
      message: 'Goal breakdown generated successfully',
    });
  } catch (error) {
    console.error('Error generating goal breakdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate goal breakdown',
      code: 'GENERATE_BREAKDOWN_ERROR',
    });
  }
};

/**
 * Generate quiz using AI
 */
const generateQuiz = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { topic, difficulty, questionCount = 5, goalId, milestoneId } = req.body;

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    }

    // Verify goal exists if provided
    if (goalId) {
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
    }

    const quizData = await geminiService.generateQuiz({
      topic,
      difficulty,
      questionCount,
    });

    // Create quiz in database
    const quiz = new Quiz({
      userId,
      goalId,
      milestoneId,
      title: quizData.title || `Quiz: ${topic}`,
      description: quizData.description || `Test your knowledge of ${topic}`,
      questions: quizData.questions,
      difficulty,
      category: topic,
      isAiGenerated: true,
      aiGenerationData: {
        prompt: `${topic} - ${difficulty} level`,
        generatedAt: new Date(),
        model: 'gemini-pro',
        topic,
      },
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      data: { quiz },
      message: 'Quiz generated and saved successfully',
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quiz',
      code: 'GENERATE_QUIZ_ERROR',
    });
  }
};

/**
 * Generate resource suggestions using AI
 */
const generateResourceSuggestions = async (req, res) => {
  try {
    const { topic, difficulty = 'intermediate' } = req.body;

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    }

    const resources = await geminiService.generateResourceSuggestions(topic, difficulty);

    res.json({
      success: true,
      data: { resources, topic, difficulty },
      message: 'Resource suggestions generated successfully',
    });
  } catch (error) {
    console.error('Error generating resource suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate resource suggestions',
      code: 'GENERATE_RESOURCES_ERROR',
    });
  }
};

/**
 * Generate motivational content based on user progress
 */
const generateMotivationalContent = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.body;

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    }

    // Get goal and progress data
    let progressData = {
      currentStreak: 0,
      completedTasks: 0,
      totalTasks: 0,
      goalTitle: 'your learning goals',
    };

    if (goalId && isValidObjectId(goalId)) {
      const goal = await Goal.findOne({ _id: goalId, userId });
      if (goal) {
        // Get tasks for this goal
        const Task = require('../models/Task');
        const tasks = await Task.find({ goalId, userId });
        const completedTasks = tasks.filter(task => task.status === 'completed');

        progressData = {
          currentStreak: 1, // Would need to calculate from Progress model
          completedTasks: completedTasks.length,
          totalTasks: tasks.length,
          goalTitle: goal.title,
        };
      }
    }

    const motivationalMessage = await geminiService.generateMotivationalContent(progressData);

    res.json({
      success: true,
      data: { message: motivationalMessage },
      message: 'Motivational content generated successfully',
    });
  } catch (error) {
    console.error('Error generating motivational content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate motivational content',
      code: 'GENERATE_MOTIVATION_ERROR',
    });
  }
};

/**
 * Get AI service status
 */
const getAIServiceStatus = async (req, res) => {
  try {
    const isAvailable = geminiService.isAvailable();
    
    res.json({
      success: true,
      data: {
        available: isAvailable,
        service: 'Google Gemini AI',
        features: [
          'Goal breakdown generation',
          'Quiz creation',
          'Resource suggestions',
          'Motivational content',
        ],
      },
      message: isAvailable ? 'AI service is available' : 'AI service is unavailable',
    });
  } catch (error) {
    console.error('Error checking AI service status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check AI service status',
      code: 'AI_STATUS_ERROR',
    });
  }
};

/**
 * Enhance existing goal with AI suggestions
 */
const enhanceGoalWithAI = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.params;

    if (!isValidObjectId(goalId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID format',
        code: 'INVALID_ID',
      });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
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

    // Generate AI breakdown for existing goal
    const breakdown = await geminiService.generateGoalBreakdown({
      title: goal.title,
      description: goal.description,
      difficulty: goal.difficulty,
      timeframe: 30, // Default timeframe
    });

    // Generate resource suggestions
    const resources = await geminiService.generateResourceSuggestions(
      goal.title,
      goal.difficulty
    );

    res.json({
      success: true,
      data: {
        goal: {
          id: goal._id,
          title: goal.title,
          description: goal.description,
        },
        breakdown,
        resources,
      },
      message: 'Goal enhanced with AI suggestions successfully',
    });
  } catch (error) {
    console.error('Error enhancing goal with AI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enhance goal with AI',
      code: 'ENHANCE_GOAL_ERROR',
    });
  }
};

/**
 * Generate study plan using AI
 */
const generateStudyPlan = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId, dailyTimeAvailable = 60, weeklyDays = 5 } = req.body;

    if (!isValidObjectId(goalId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID format',
        code: 'INVALID_GOAL_ID',
      });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
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

    // Get existing tasks for this goal
    const Task = require('../models/Task');
    const existingTasks = await Task.find({ goalId, userId, status: { $ne: 'completed' } });

    // Generate study plan based on goal and constraints
    const breakdown = await geminiService.generateGoalBreakdown({
      title: goal.title,
      description: goal.description,
      difficulty: goal.difficulty,
      timeframe: Math.ceil((existingTasks.length * 60) / (dailyTimeAvailable * weeklyDays * 7)), // Estimate based on existing tasks
    });

    // Calculate suggested schedule
    const studyPlan = {
      dailyTimeRecommended: dailyTimeAvailable,
      weeklyDays,
      estimatedWeeks: Math.ceil(breakdown.totalEstimatedDays / weeklyDays),
      breakdown,
      schedule: [], // Could be enhanced to generate specific daily schedules
    };

    res.json({
      success: true,
      data: { studyPlan },
      message: 'Study plan generated successfully',
    });
  } catch (error) {
    console.error('Error generating study plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate study plan',
      code: 'GENERATE_STUDY_PLAN_ERROR',
    });
  }
};

module.exports = {
  generateGoalBreakdown,
  generateQuiz,
  generateResourceSuggestions,
  generateMotivationalContent,
  getAIServiceStatus,
  enhanceGoalWithAI,
  generateStudyPlan,
};