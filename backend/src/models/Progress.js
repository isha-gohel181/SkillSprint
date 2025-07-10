const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    achievements: [{
      type: String,
      // Achievement types: 'first_task', 'streak_7', 'streak_30', 'goal_50_percent', 'goal_completed', etc.
    }],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
progressSchema.index({ userId: 1, date: -1 });
progressSchema.index({ goalId: 1, date: -1 });
progressSchema.index({ userId: 1, goalId: 1, date: -1 });

module.exports = mongoose.model("Progress", progressSchema);