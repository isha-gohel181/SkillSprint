/**
 * Validation utility functions for SkillSprint application
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate goal difficulty level
 * @param {string} difficulty
 * @returns {boolean}
 */
const isValidDifficulty = (difficulty) => {
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  return validDifficulties.includes(difficulty);
};

/**
 * Validate goal category
 * @param {string} category
 * @returns {boolean}
 */
const isValidCategory = (category) => {
  const validCategories = [
    'programming',
    'design',
    'business',
    'marketing',
    'data-science',
    'languages',
    'health',
    'music',
    'art',
    'other'
  ];
  return validCategories.includes(category);
};

/**
 * Validate task priority
 * @param {string} priority
 * @returns {boolean}
 */
const isValidPriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  return validPriorities.includes(priority);
};

/**
 * Validate task status
 * @param {string} status
 * @returns {boolean}
 */
const isValidTaskStatus = (status) => {
  const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
  return validStatuses.includes(status);
};

/**
 * Validate goal status
 * @param {string} status
 * @returns {boolean}
 */
const isValidGoalStatus = (status) => {
  const validStatuses = ['active', 'paused', 'completed', 'cancelled'];
  return validStatuses.includes(status);
};

/**
 * Validate time estimate (in minutes)
 * @param {number} timeEstimate
 * @returns {boolean}
 */
const isValidTimeEstimate = (timeEstimate) => {
  return typeof timeEstimate === 'number' && timeEstimate > 0 && timeEstimate <= 1440; // max 24 hours
};

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate progress percentage
 * @param {number} percentage
 * @returns {boolean}
 */
const isValidPercentage = (percentage) => {
  return typeof percentage === 'number' && percentage >= 0 && percentage <= 100;
};

/**
 * Validate quiz question type
 * @param {string} type
 * @returns {boolean}
 */
const isValidQuestionType = (type) => {
  const validTypes = ['multiple-choice', 'true-false', 'fill-in-blank', 'essay'];
  return validTypes.includes(type);
};

/**
 * Sanitize text input (remove HTML tags and trim)
 * @param {string} text
 * @returns {string}
 */
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validate string length
 * @param {string} str
 * @param {number} minLength
 * @param {number} maxLength
 * @returns {boolean}
 */
const isValidLength = (str, minLength = 1, maxLength = 1000) => {
  if (typeof str !== 'string') return false;
  return str.trim().length >= minLength && str.trim().length <= maxLength;
};

/**
 * Validate array of strings
 * @param {Array} arr
 * @param {number} maxItems
 * @returns {boolean}
 */
const isValidStringArray = (arr, maxItems = 10) => {
  if (!Array.isArray(arr)) return false;
  if (arr.length > maxItems) return false;
  return arr.every(item => typeof item === 'string' && item.trim().length > 0);
};

module.exports = {
  isValidEmail,
  isValidObjectId,
  isValidDifficulty,
  isValidCategory,
  isValidPriority,
  isValidTaskStatus,
  isValidGoalStatus,
  isValidTimeEstimate,
  isValidUrl,
  isValidPercentage,
  isValidQuestionType,
  sanitizeText,
  isValidLength,
  isValidStringArray,
};