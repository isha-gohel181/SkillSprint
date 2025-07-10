const {
  validateGoal,
  validateTask,
  validateProgress,
} = require("../utils/validators");

// Validation middleware for goal creation/update
const validateGoalData = (req, res, next) => {
  const errors = validateGoal(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

// Validation middleware for task creation/update
const validateTaskData = (req, res, next) => {
  const errors = validateTask(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

// Validation middleware for progress logging
const validateProgressData = (req, res, next) => {
  const errors = validateProgress(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

// Generic validation middleware
const validate = (validatorFunction) => {
  return (req, res, next) => {
    const errors = validatorFunction(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
};

module.exports = {
  validateGoalData,
  validateTaskData,
  validateProgressData,
  validate,
};
