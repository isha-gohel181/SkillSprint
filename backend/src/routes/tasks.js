const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validation');
const taskController = require('../controllers/taskController');

// Apply authentication middleware to all routes
router.use(requireAuth());

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 */
router.get('/', taskController.getTasks);

/**
 * @route   GET /api/tasks/daily
 * @desc    Get daily tasks (due today or scheduled for today)
 * @access  Private
 */
router.get('/daily', taskController.getDailyTasks);

/**
 * @route   GET /api/tasks/overdue
 * @desc    Get overdue tasks
 * @access  Private
 */
router.get('/overdue', taskController.getOverdueTasks);

/**
 * @route   GET /api/tasks/priority/:priority
 * @desc    Get tasks by priority
 * @access  Private
 */
router.get('/priority/:priority', taskController.getTasksByPriority);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get specific task by ID
 * @access  Private
 */
router.get('/:id', validateObjectId('id'), taskController.getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validate(schemas.createTask), taskController.createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', validateObjectId('id'), validate(schemas.updateTask), taskController.updateTask);

/**
 * @route   POST /api/tasks/:id/complete
 * @desc    Complete a task
 * @access  Private
 */
router.post('/:id/complete', validateObjectId('id'), taskController.completeTask);

/**
 * @route   POST /api/tasks/:id/schedule
 * @desc    Schedule a task for a specific date
 * @access  Private
 */
router.post('/:id/schedule', validateObjectId('id'), taskController.scheduleTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (soft delete)
 * @access  Private
 */
router.delete('/:id', validateObjectId('id'), taskController.deleteTask);

module.exports = router;