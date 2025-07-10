const geminiService = require("../services/geminiService");
const Goal = require("../models/Goal");
const Quiz = require("../models/Quiz");

// AI Goal Breakdown
const breakdownGoal = async (req, res) => {
  try {
    const { title, description, duration, difficulty } = req.body;

    // Validate required fields
    if (!title || !description || !duration || !difficulty) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: title, description, duration, difficulty",
      });
    }

    // Call Gemini AI service
    const breakdown = await geminiService.breakdownGoal(
      title,
      description,
      parseInt(duration),
      difficulty
    );

    res.json({
      success: true,
      data: breakdown,
      message: "Goal breakdown generated successfully",
    });
  } catch (error) {
    console.error("Error in AI goal breakdown:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate goal breakdown",
      details: error.message,
    });
  }
};

// Generate Quiz for Milestone
const generateQuiz = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId, milestone } = req.body;

    // Validate required fields
    if (!goalId || !milestone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: goalId, milestone",
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

    // Check if quiz already exists for this milestone
    const existingQuiz = await Quiz.findOne({ goalId, userId, milestone });
    if (existingQuiz) {
      return res.json({
        success: true,
        data: { quiz: existingQuiz },
        message: "Quiz already exists for this milestone",
      });
    }

    // Generate quiz using AI
    const goalContext = `${goal.title}: ${goal.description}`;
    const quizData = await geminiService.generateQuiz(milestone, goalContext);

    // Create and save quiz
    const quiz = new Quiz({
      goalId,
      userId,
      milestone,
      questions: quizData.questions || [],
    });

    await quiz.save();

    res.json({
      success: true,
      data: { quiz },
      message: "Quiz generated successfully",
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate quiz",
      details: error.message,
    });
  }
};

// Submit Quiz Answers
const submitQuizAnswers = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { quizId, answers } = req.body;

    // Validate required fields
    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: quizId, answers (array)",
      });
    }

    // Find quiz
    const quiz = await Quiz.findOne({ _id: quizId, userId });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const userAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = question && question.correctAnswer === answer;
      if (isCorrect) correctAnswers++;

      return {
        questionIndex: index,
        answer,
        correct: isCorrect,
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= 70; // 70% passing score

    // Update quiz with results
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.passed = passed;
    quiz.completedAt = new Date();

    await quiz.save();

    res.json({
      success: true,
      data: {
        quiz,
        results: {
          score,
          passed,
          correctAnswers,
          totalQuestions: quiz.questions.length,
          passingScore: 70,
        },
      },
      message: passed
        ? "Quiz passed successfully!"
        : "Quiz completed. Try again to improve your score.",
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit quiz answers",
    });
  }
};

// Get Resource Suggestions
const suggestResources = async (req, res) => {
  try {
    const { topic, difficulty = "Beginner" } = req.query;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "Topic parameter is required",
      });
    }

    const suggestions = await geminiService.suggestResources(topic, difficulty);

    res.json({
      success: true,
      data: suggestions,
      message: "Resource suggestions generated successfully",
    });
  } catch (error) {
    console.error("Error getting resource suggestions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get resource suggestions",
    });
  }
};

// Get Motivational Quote
const getMotivationalQuote = async (req, res) => {
  try {
    const { goalType = "learning" } = req.query;

    const quote = await geminiService.getMotivationalQuote(goalType);

    res.json({
      success: true,
      data: { quote },
      message: "Motivational quote generated successfully",
    });
  } catch (error) {
    console.error("Error getting motivational quote:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get motivational quote",
    });
  }
};

// Get User's Quizzes
const getUserQuizzes = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { goalId } = req.query;

    const filter = { userId };
    if (goalId) filter.goalId = goalId;

    const quizzes = await Quiz.find(filter)
      .populate("goalId", "title category")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { quizzes },
    });
  } catch (error) {
    console.error("Error getting user quizzes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get quizzes",
    });
  }
};

module.exports = {
  breakdownGoal,
  generateQuiz,
  submitQuizAnswers,
  suggestResources,
  getMotivationalQuote,
  getUserQuizzes,
};
