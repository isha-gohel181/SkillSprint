const Joi = require('joi');

/**
 * Middleware for request validation using Joi
 */

// Common schemas
const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();

// Goal validation schemas
const createGoalSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(1000).required(),
  category: Joi.string().valid(
    'programming', 'design', 'business', 'marketing', 
    'data-science', 'languages', 'health', 'music', 'art', 'other'
  ).required(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  targetDate: Joi.date().min('now').optional(),
  tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).optional(),
});

const updateGoalSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().min(1).max(1000).optional(),
  category: Joi.string().valid(
    'programming', 'design', 'business', 'marketing', 
    'data-science', 'languages', 'health', 'music', 'art', 'other'
  ).optional(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  targetDate: Joi.date().min('now').optional(),
  status: Joi.string().valid('active', 'paused', 'completed', 'cancelled').optional(),
  tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).optional(),
});

// Task validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(1000).optional(),
  goalId: objectIdSchema,
  milestoneId: objectIdSchema.optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  estimatedTime: Joi.number().min(1).max(1440).optional(), // minutes
  dueDate: Joi.date().min('now').optional(),
  resources: Joi.array().items(
    Joi.object({
      title: Joi.string().min(1).max(200).required(),
      url: Joi.string().uri().required(),
      type: Joi.string().valid('article', 'video', 'course', 'tool', 'book', 'other').optional()
    })
  ).max(10).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().min(1).max(1000).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled').optional(),
  estimatedTime: Joi.number().min(1).max(1440).optional(),
  actualTime: Joi.number().min(1).max(1440).optional(),
  dueDate: Joi.date().optional(),
  resources: Joi.array().items(
    Joi.object({
      title: Joi.string().min(1).max(200).required(),
      url: Joi.string().uri().required(),
      type: Joi.string().valid('article', 'video', 'course', 'tool', 'book', 'other').optional()
    })
  ).max(10).optional(),
});

// Progress validation schemas
const logProgressSchema = Joi.object({
  goalId: objectIdSchema,
  taskId: objectIdSchema.optional(),
  timeSpent: Joi.number().min(1).max(1440).required(), // minutes
  description: Joi.string().min(1).max(500).required(),
  date: Joi.date().max('now').optional(),
});

// Quiz validation schemas
const createQuizSchema = Joi.object({
  goalId: objectIdSchema,
  milestoneId: objectIdSchema.optional(),
  title: Joi.string().min(1).max(200).required(),
  questions: Joi.array().items(
    Joi.object({
      question: Joi.string().min(1).max(500).required(),
      type: Joi.string().valid('multiple-choice', 'true-false', 'fill-in-blank', 'essay').required(),
      options: Joi.array().items(Joi.string().min(1).max(200)).when('type', {
        is: 'multiple-choice',
        then: Joi.required().min(2).max(6),
        otherwise: Joi.optional()
      }),
      correctAnswer: Joi.alternatives().try(
        Joi.string().min(1).max(200),
        Joi.number().min(0),
        Joi.boolean()
      ).required(),
      explanation: Joi.string().max(300).optional(),
    })
  ).min(1).max(20).required(),
});

// AI request validation schemas
const generateGoalBreakdownSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(1000).required(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  timeframe: Joi.number().min(1).max(365).optional(), // days
});

const generateQuizSchema = Joi.object({
  topic: Joi.string().min(1).max(200).required(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  questionCount: Joi.number().min(1).max(20).default(5),
});

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema
 * @param {string} property - Property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
    }

    req[property] = value;
    next();
  };
};

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`,
        code: 'INVALID_ID',
      });
    }
    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
  schemas: {
    createGoal: createGoalSchema,
    updateGoal: updateGoalSchema,
    createTask: createTaskSchema,
    updateTask: updateTaskSchema,
    logProgress: logProgressSchema,
    createQuiz: createQuizSchema,
    generateGoalBreakdown: generateGoalBreakdownSchema,
    generateQuiz: generateQuizSchema,
  },
};