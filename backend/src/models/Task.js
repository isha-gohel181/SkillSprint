const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format',
    },
  },
  type: {
    type: String,
    enum: ['article', 'video', 'course', 'tool', 'book', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    maxlength: 300,
    trim: true,
  },
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
      index: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    estimatedTime: {
      type: Number, // in minutes
      min: 1,
      max: 1440, // max 24 hours
    },
    actualTime: {
      type: Number, // in minutes
      min: 0,
      max: 1440,
      default: 0,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value >= new Date().setHours(0, 0, 0, 0);
        },
        message: 'Due date cannot be in the past',
      },
    },
    completedAt: {
      type: Date,
      default: null,
    },
    scheduledFor: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value >= new Date().setHours(0, 0, 0, 0);
        },
        message: 'Scheduled date cannot be in the past',
      },
    },
    resources: [resourceSchema],
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      interval: {
        type: Number,
        min: 1,
        max: 30,
      },
      endDate: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    aiGenerationData: {
      prompt: String,
      generatedAt: Date,
      goalContext: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, goalId: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, scheduledFor: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ goalId: 1, order: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for checking if task is due today
taskSchema.virtual('isDueToday').get(function() {
  if (!this.dueDate) return false;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  return (
    today.getFullYear() === dueDate.getFullYear() &&
    today.getMonth() === dueDate.getMonth() &&
    today.getDate() === dueDate.getDate()
  );
});

// Pre-save middleware to handle completion
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Method to mark task as completed
taskSchema.methods.markCompleted = function(timeSpent = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (timeSpent) {
    this.actualTime = timeSpent;
  }
  return this.save();
};

// Method to add resource
taskSchema.methods.addResource = function(resourceData) {
  this.resources.push(resourceData);
  return this.save();
};

// Method to estimate completion date based on user's daily capacity
taskSchema.methods.getEstimatedCompletionDate = function(dailyCapacityMinutes = 60) {
  if (!this.estimatedTime) return null;
  
  const daysNeeded = Math.ceil(this.estimatedTime / dailyCapacityMinutes);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);
  return completionDate;
};

// Static method to get tasks due today for a user
taskSchema.statics.getDueTodayForUser = function(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    status: { $in: ['pending', 'in-progress'] },
    dueDate: { $gte: startOfDay, $lte: endOfDay },
  }).populate('goalId', 'title category');
};

// Static method to get overdue tasks for a user
taskSchema.statics.getOverdueForUser = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    status: { $in: ['pending', 'in-progress'] },
    dueDate: { $lt: now },
  }).populate('goalId', 'title category');
};

// Static method to get tasks by priority for a user
taskSchema.statics.getByPriorityForUser = function(userId, priority) {
  return this.find({
    userId,
    priority,
    status: { $in: ['pending', 'in-progress'] },
  }).populate('goalId', 'title category').sort({ dueDate: 1, createdAt: 1 });
};

// Exclude deleted tasks by default
taskSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Task', taskSchema);