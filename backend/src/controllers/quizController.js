const Quiz = require('../models/Quiz');
const Goal = require('../models/Goal');
const { isValidObjectId } = require('../utils/validators');

/**
 * Quiz Controller - Handles quiz operations and attempt management
 */

/**
 * Get all quizzes for user
 */
const getQuizzes = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { 
      goalId,
      difficulty,
      category,
      isActive,
      page = 1, 
      limit = 10,
    } = req.query;

    // Build query
    const query = { userId };
    if (goalId && isValidObjectId(goalId)) query.goalId = goalId;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get quizzes without attempts data for privacy
    const quizzes = await Quiz.find(query)
      .select('-attempts')
      .populate('goalId', 'title category difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + quizzes.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
      message: 'Quizzes retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes',
      code: 'FETCH_QUIZZES_ERROR',
    });
  }
};

/**
 * Get a specific quiz by ID (without correct answers for security)
 */
const getQuizById = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID format',
        code: 'INVALID_ID',
      });
    }

    const quiz = await Quiz.findOne({ _id: id, userId })
      .populate('goalId', 'title category difficulty');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        code: 'QUIZ_NOT_FOUND',
      });
    }

    // Remove correct answers and explanations for security
    const safeQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
        order: q.order,
      })),
      attempts: undefined, // Don't include attempts in detail view
    };

    res.json({
      success: true,
      data: { quiz: safeQuiz },
      message: 'Quiz retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz',
      code: 'FETCH_QUIZ_ERROR',
    });
  }
};

/**
 * Create a new quiz
 */
const createQuiz = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.body;

    // Verify goal exists and belongs to user
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

    const quizData = {
      ...req.body,
      userId,
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    res.status(201).json({
      success: true,
      data: { quiz },
      message: 'Quiz created successfully',
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    
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
      error: 'Failed to create quiz',
      code: 'CREATE_QUIZ_ERROR',
    });
  }
};

/**
 * Start a quiz attempt
 */
const startQuizAttempt = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID format',
        code: 'INVALID_ID',
      });
    }

    const quiz = await Quiz.findOne({ _id: id, isActive: true });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found or inactive',
        code: 'QUIZ_NOT_FOUND',
      });
    }

    try {
      const attemptData = quiz.startAttempt(userId);
      
      res.json({
        success: true,
        data: { attempt: attemptData },
        message: 'Quiz attempt started successfully',
      });
    } catch (error) {
      if (error.message === 'Maximum attempts reached') {
        return res.status(400).json({
          success: false,
          error: 'Maximum attempts reached for this quiz',
          code: 'MAX_ATTEMPTS_REACHED',
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start quiz attempt',
      code: 'START_ATTEMPT_ERROR',
    });
  }
};

/**
 * Submit a quiz attempt
 */
const submitQuizAttempt = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { answers, timeSpent } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID format',
        code: 'INVALID_ID',
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Answers are required',
        code: 'MISSING_ANSWERS',
      });
    }

    const quiz = await Quiz.findOne({ _id: id, isActive: true });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found or inactive',
        code: 'QUIZ_NOT_FOUND',
      });
    }

    try {
      const attempt = await quiz.submitAttempt(userId, answers, timeSpent || 0);
      
      res.json({
        success: true,
        data: { attempt },
        message: 'Quiz attempt submitted successfully',
      });
    } catch (error) {
      if (error.message === 'Invalid question ID') {
        return res.status(400).json({
          success: false,
          error: 'Invalid question ID in answers',
          code: 'INVALID_QUESTION_ID',
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz attempt',
      code: 'SUBMIT_ATTEMPT_ERROR',
    });
  }
};

/**
 * Get user's quiz attempts
 */
const getUserQuizAttempts = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID format',
        code: 'INVALID_ID',
      });
    }

    const quiz = await Quiz.findById(id).select('title attempts');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        code: 'QUIZ_NOT_FOUND',
      });
    }

    // Filter attempts for the current user
    const userAttempts = quiz.attempts.filter(attempt => attempt.userId === userId);

    res.json({
      success: true,
      data: { 
        quizTitle: quiz.title,
        attempts: userAttempts,
        attemptsCount: userAttempts.length,
        bestScore: userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : 0,
      },
      message: 'Quiz attempts retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz attempts',
      code: 'FETCH_ATTEMPTS_ERROR',
    });
  }
};

/**
 * Get quiz results with correct answers (after submission)
 */
const getQuizResults = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id, attemptId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        code: 'INVALID_ID',
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        code: 'QUIZ_NOT_FOUND',
      });
    }

    // Find the specific attempt
    const attempt = quiz.attempts.id(attemptId);

    if (!attempt || attempt.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Quiz attempt not found',
        code: 'ATTEMPT_NOT_FOUND',
      });
    }

    // Build results with correct answers and explanations
    const results = {
      attemptId: attempt._id,
      score: attempt.score,
      totalCorrect: attempt.totalCorrect,
      totalQuestions: attempt.totalQuestions,
      timeSpent: attempt.timeSpent,
      passed: attempt.passed,
      completedAt: attempt.completedAt,
      questions: quiz.questions.map(question => {
        const userAnswer = attempt.answers.find(a => a.questionId.toString() === question._id.toString());
        return {
          question: question.question,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          userAnswer: userAnswer ? userAnswer.answer : null,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
          points: question.points,
        };
      }),
    };

    res.json({
      success: true,
      data: { results },
      message: 'Quiz results retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz results',
      code: 'FETCH_RESULTS_ERROR',
    });
  }
};

/**
 * Update quiz
 */
const updateQuiz = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID format',
        code: 'INVALID_ID',
      });
    }

    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('goalId', 'title category difficulty');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        code: 'QUIZ_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { quiz },
      message: 'Quiz updated successfully',
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    
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
      error: 'Failed to update quiz',
      code: 'UPDATE_QUIZ_ERROR',
    });
  }
};

/**
 * Delete quiz (soft delete)
 */
const deleteQuiz = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID format',
        code: 'INVALID_ID',
      });
    }

    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, userId },
      { isDeleted: true },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        code: 'QUIZ_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { quizId: id },
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quiz',
      code: 'DELETE_QUIZ_ERROR',
    });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getUserQuizAttempts,
  getQuizResults,
  updateQuiz,
  deleteQuiz,
};