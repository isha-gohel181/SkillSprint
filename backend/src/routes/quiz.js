const express = require("express");
const { Quiz, QuizAttempt } = require("../models/Quiz");
const Goal = require("../models/Goal");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/quiz/goal/:goalId - Get quizzes for a specific goal
router.get("/goal/:goalId", async (req, res) => {
  try {
    const { goalId } = req.params;
    
    // Verify the goal belongs to the user
    const goal = await Goal.findOne({
      _id: goalId,
      userId: req.auth.userId,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        error: "Goal not found" 
      });
    }

    const quizzes = await Quiz.find({
      goalId,
      isActive: true
    }).select('-questions.correctAnswer -questions.options.isCorrect');
    
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch quizzes" 
    });
  }
});

// GET /api/quiz/:id - Get a specific quiz for taking
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      isActive: true
    }).select('-questions.correctAnswer -questions.options.isCorrect');

    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: "Quiz not found" 
      });
    }

    // Verify the goal belongs to the user
    const goal = await Goal.findOne({
      _id: quiz.goalId,
      userId: req.auth.userId,
      isActive: true
    });

    if (!goal) {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied" 
      });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch quiz" 
    });
  }
});

// POST /api/quiz/:id/submit - Submit quiz answers
router.post("/:id/submit", async (req, res) => {
  try {
    const { answers, timeSpent, startedAt } = req.body;
    
    // Get the full quiz with correct answers
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        error: "Quiz not found" 
      });
    }

    // Verify the goal belongs to the user
    const goal = await Goal.findOne({
      _id: quiz.goalId,
      userId: req.auth.userId,
      isActive: true
    });

    if (!goal) {
      return res.status(403).json({ 
        success: false, 
        error: "Access denied" 
      });
    }

    // Grade the quiz
    let score = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      let isCorrect = false;
      let points = 0;

      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const selectedOption = question.options[parseInt(answer.answer)];
        isCorrect = selectedOption && selectedOption.isCorrect;
      } else if (question.type === 'short_answer') {
        // Simple string comparison (case-insensitive)
        isCorrect = answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      }

      if (isCorrect) {
        points = question.points;
        score += points;
      }

      return {
        questionIndex: index,
        answer: answer.answer,
        isCorrect,
        points
      };
    });

    const percentage = Math.round((score / quiz.totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;

    // Create quiz attempt
    const attempt = new QuizAttempt({
      userId: req.auth.userId,
      quizId: quiz._id,
      goalId: quiz.goalId,
      answers: gradedAnswers,
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      passed,
      timeSpent,
      startedAt: new Date(startedAt),
      completedAt: new Date()
    });

    await attempt.save();

    // Return results with explanations
    const results = {
      attemptId: attempt._id,
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      passed,
      answers: gradedAnswers.map((answer, index) => ({
        ...answer,
        question: quiz.questions[index].question,
        explanation: quiz.questions[index].explanation,
        correctAnswer: quiz.questions[index].type === 'short_answer' 
          ? quiz.questions[index].correctAnswer 
          : quiz.questions[index].options.find(opt => opt.isCorrect)?.text
      }))
    };

    res.json({ success: true, results });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to submit quiz" 
    });
  }
});

// GET /api/quiz/attempts/history - Get user's quiz attempt history
router.get("/attempts/history", async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      userId: req.auth.userId
    })
    .populate('quizId', 'title')
    .populate('goalId', 'title category')
    .sort({ completedAt: -1 });
    
    res.json({ success: true, attempts });
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch quiz history" 
    });
  }
});

// GET /api/quiz/attempts/:attemptId - Get specific quiz attempt details
router.get("/attempts/:attemptId", async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.auth.userId
    })
    .populate('quizId')
    .populate('goalId', 'title category');

    if (!attempt) {
      return res.status(404).json({ 
        success: false, 
        error: "Quiz attempt not found" 
      });
    }

    res.json({ success: true, attempt });
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch quiz attempt" 
    });
  }
});

module.exports = router;