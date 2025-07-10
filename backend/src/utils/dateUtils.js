/**
 * Date utility functions for SkillSprint application
 */

/**
 * Get the start of today in UTC
 * @returns {Date}
 */
const getStartOfToday = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

/**
 * Get the end of today in UTC
 * @returns {Date}
 */
const getEndOfToday = () => {
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);
  return today;
};

/**
 * Get date N days ago from today
 * @param {number} days - Number of days ago
 * @returns {Date}
 */
const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Get date N days from today
 * @param {number} days - Number of days from today
 * @returns {Date}
 */
const getDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Check if two dates are on the same day
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get the difference in days between two dates
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number}
 */
const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Check if a date is today
 * @param {Date} date
 * @returns {boolean}
 */
const isToday = (date) => {
  return isSameDay(date, new Date());
};

/**
 * Check if a date is yesterday
 * @param {Date} date
 * @returns {boolean}
 */
const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
const formatDateToString = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Get week start date (Monday)
 * @param {Date} date
 * @returns {Date}
 */
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get month start date
 * @param {Date} date
 * @returns {Date}
 */
const getMonthStart = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

module.exports = {
  getStartOfToday,
  getEndOfToday,
  getDaysAgo,
  getDaysFromNow,
  isSameDay,
  getDaysDifference,
  isToday,
  isYesterday,
  formatDateToString,
  getWeekStart,
  getMonthStart,
};