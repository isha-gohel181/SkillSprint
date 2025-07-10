const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validation');
const progressController = require('../controllers/progressController');

// Apply authentication middleware to all routes
router.use(requireAuth());

/**
 * @route   POST /api/progress
 * @desc    Log progress for a goal/task
 * @access  Private
 */
router.post('/', validate(schemas.logProgress), progressController.logProgress);

/**
 * @route   GET /api/progress
 * @desc    Get all progress entries for user
 * @access  Private
 */
router.get('/', progressController.getProgress);

/**
 * @route   GET /api/progress/daily
 * @desc    Get daily progress for user
 * @access  Private
 */
router.get('/daily', progressController.getDailyProgress);

/**
 * @route   GET /api/progress/weekly
 * @desc    Get weekly progress for user
 * @access  Private
 */
router.get('/weekly', progressController.getWeeklyProgress);

/**
 * @route   GET /api/progress/monthly
 * @desc    Get monthly progress for user
 * @access  Private
 */
router.get('/monthly', progressController.getMonthlyProgress);

/**
 * @route   GET /api/progress/streak
 * @desc    Get user's learning streak
 * @access  Private
 */
router.get('/streak', progressController.getStreak);

/**
 * @route   GET /api/progress/analytics
 * @desc    Get progress analytics
 * @access  Private
 */
router.get('/analytics', progressController.getAnalytics);

/**
 * @route   PUT /api/progress/:id
 * @desc    Update progress entry
 * @access  Private
 */
router.put('/:id', validateObjectId('id'), progressController.updateProgress);

/**
 * @route   DELETE /api/progress/:id
 * @desc    Delete progress entry (soft delete)
 * @access  Private
 */
router.delete('/:id', validateObjectId('id'), progressController.deleteProgress);

module.exports = router;