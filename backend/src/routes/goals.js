const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validation');
const goalController = require('../controllers/goalController');

// Apply authentication middleware to all routes
router.use(requireAuth());

/**
 * @route   GET /api/goals
 * @desc    Get all goals for authenticated user
 * @access  Private
 */
router.get('/', goalController.getGoals);

/**
 * @route   GET /api/goals/:id
 * @desc    Get specific goal by ID
 * @access  Private
 */
router.get('/:id', validateObjectId('id'), goalController.getGoalById);

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/', validate(schemas.createGoal), goalController.createGoal);

/**
 * @route   POST /api/goals/ai
 * @desc    Create a goal with AI-generated breakdown
 * @access  Private
 */
router.post('/ai', validate(schemas.generateGoalBreakdown), goalController.createGoalWithAI);

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put('/:id', validateObjectId('id'), validate(schemas.updateGoal), goalController.updateGoal);

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal (soft delete)
 * @access  Private
 */
router.delete('/:id', validateObjectId('id'), goalController.deleteGoal);

/**
 * @route   POST /api/goals/:goalId/milestones/:milestoneId/complete
 * @desc    Complete a milestone
 * @access  Private
 */
router.post('/:goalId/milestones/:milestoneId/complete', 
  validateObjectId('goalId'),
  validateObjectId('milestoneId'),
  goalController.completeMilestone
);

/**
 * @route   GET /api/goals/:id/analytics
 * @desc    Get goal analytics
 * @access  Private
 */
router.get('/:id/analytics', validateObjectId('id'), goalController.getGoalAnalytics);

module.exports = router;