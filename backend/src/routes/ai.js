const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validation');
const aiController = require('../controllers/aiController');

// Apply authentication middleware to all routes
router.use(requireAuth());

/**
 * @route   GET /api/ai/status
 * @desc    Get AI service status
 * @access  Private
 */
router.get('/status', aiController.getAIServiceStatus);

/**
 * @route   POST /api/ai/goal-breakdown
 * @desc    Generate goal breakdown using AI
 * @access  Private
 */
router.post('/goal-breakdown', validate(schemas.generateGoalBreakdown), aiController.generateGoalBreakdown);

/**
 * @route   POST /api/ai/quiz
 * @desc    Generate quiz using AI
 * @access  Private
 */
router.post('/quiz', validate(schemas.generateQuiz), aiController.generateQuiz);

/**
 * @route   POST /api/ai/resources
 * @desc    Generate resource suggestions using AI
 * @access  Private
 */
router.post('/resources', aiController.generateResourceSuggestions);

/**
 * @route   POST /api/ai/motivation
 * @desc    Generate motivational content based on user progress
 * @access  Private
 */
router.post('/motivation', aiController.generateMotivationalContent);

/**
 * @route   POST /api/ai/enhance-goal/:goalId
 * @desc    Enhance existing goal with AI suggestions
 * @access  Private
 */
router.post('/enhance-goal/:goalId', validateObjectId('goalId'), aiController.enhanceGoalWithAI);

/**
 * @route   POST /api/ai/study-plan
 * @desc    Generate study plan using AI
 * @access  Private
 */
router.post('/study-plan', aiController.generateStudyPlan);

module.exports = router;