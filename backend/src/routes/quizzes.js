const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validation');
const quizController = require('../controllers/quizController');

// Apply authentication middleware to all routes
router.use(requireAuth());

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes for user
 * @access  Private
 */
router.get('/', quizController.getQuizzes);

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get specific quiz by ID
 * @access  Private
 */
router.get('/:id', validateObjectId('id'), quizController.getQuizById);

/**
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Private
 */
router.post('/', validate(schemas.createQuiz), quizController.createQuiz);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Update a quiz
 * @access  Private
 */
router.put('/:id', validateObjectId('id'), quizController.updateQuiz);

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete a quiz (soft delete)
 * @access  Private
 */
router.delete('/:id', validateObjectId('id'), quizController.deleteQuiz);

/**
 * @route   POST /api/quizzes/:id/start
 * @desc    Start a quiz attempt
 * @access  Private
 */
router.post('/:id/start', validateObjectId('id'), quizController.startQuizAttempt);

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Submit a quiz attempt
 * @access  Private
 */
router.post('/:id/submit', validateObjectId('id'), quizController.submitQuizAttempt);

/**
 * @route   GET /api/quizzes/:id/attempts
 * @desc    Get user's quiz attempts
 * @access  Private
 */
router.get('/:id/attempts', validateObjectId('id'), quizController.getUserQuizAttempts);

/**
 * @route   GET /api/quizzes/:id/results/:attemptId
 * @desc    Get quiz results with correct answers
 * @access  Private
 */
router.get('/:id/results/:attemptId', 
  validateObjectId('id'), 
  validateObjectId('attemptId'), 
  quizController.getQuizResults
);

module.exports = router;