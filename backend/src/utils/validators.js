const validateGoal = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters long");
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push("Description must be at least 10 characters long");
  }

  if (!data.category || data.category.trim().length < 2) {
    errors.push("Category is required");
  }

  if (!["Beginner", "Intermediate", "Advanced"].includes(data.difficulty)) {
    errors.push("Difficulty must be Beginner, Intermediate, or Advanced");
  }

  if (
    !data.targetDuration ||
    data.targetDuration < 1 ||
    data.targetDuration > 365
  ) {
    errors.push("Target duration must be between 1 and 365 days");
  }

  return errors;
};

const validateTask = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters long");
  }

  if (!data.description || data.description.trim().length < 5) {
    errors.push("Description must be at least 5 characters long");
  }

  if (
    !["Reading", "Video", "Practice", "Quiz", "Project"].includes(data.type)
  ) {
    errors.push("Type must be Reading, Video, Practice, Quiz, or Project");
  }

  if (
    !data.estimatedTime ||
    data.estimatedTime < 1 ||
    data.estimatedTime > 480
  ) {
    errors.push("Estimated time must be between 1 and 480 minutes");
  }

  if (!["Easy", "Medium", "Hard"].includes(data.difficulty)) {
    errors.push("Difficulty must be Easy, Medium, or Hard");
  }

  return errors;
};

const validateProgress = (data) => {
  const errors = [];

  if (data.tasksCompleted < 0) {
    errors.push("Tasks completed cannot be negative");
  }

  if (data.totalTasks < 0) {
    errors.push("Total tasks cannot be negative");
  }

  if (data.timeSpent < 0) {
    errors.push("Time spent cannot be negative");
  }

  if (data.tasksCompleted > data.totalTasks) {
    errors.push("Tasks completed cannot exceed total tasks");
  }

  return errors;
};

module.exports = {
  validateGoal,
  validateTask,
  validateProgress,
};
