const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['reading', 'practice', 'project', 'quiz', 'video', 'assignment'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['article', 'video', 'book', 'course', 'tool', 'other'],
      },
    }],
    notes: {
      type: String,
      default: '',
    },
    isDaily: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ goalId: 1 });

module.exports = mongoose.model("Task", taskSchema);