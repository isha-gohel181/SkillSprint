const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  breakdownGoal,
  generateQuiz,
  submitQuizAnswers,
  suggestResources,
  getMotivationalQuote,
  getUserQuizzes,
} = require("../controllers/aiController");

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// AI routes
router.post("/breakdown-goal", breakdownGoal);
router.post("/generate-quiz", generateQuiz);
router.post("/submit-quiz", submitQuizAnswers);
router.get("/suggest-resources", suggestResources);
router.get("/motivational-quote", getMotivationalQuote);
router.get("/quizzes", getUserQuizzes);

module.exports = router;
