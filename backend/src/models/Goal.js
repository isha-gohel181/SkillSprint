const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  order: {
    type: Number,
    required: true,
    min: 1,
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 1,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk user ID
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'paused', 'completed', 'cancelled'],
      default: 'active',
    },
    milestones: [milestoneSchema],
    targetDate: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value > new Date();
        },
        message: 'Target date must be in the future',
      },
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50,
    }],
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    aiGenerationData: {
      prompt: String,
      generatedAt: Date,
      model: String,
    },
    totalEstimatedTime: {
      type: Number, // in minutes
      default: 0,
    },
    actualTimeSpent: {
      type: Number, // in minutes
      default: 0,
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
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });
goalSchema.index({ targetDate: 1 });

// Virtual for completion percentage based on milestones
goalSchema.virtual('milestoneProgress').get(function() {
  if (this.milestones.length === 0) return 0;
  const completedMilestones = this.milestones.filter(m => m.isCompleted).length;
  return Math.round((completedMilestones / this.milestones.length) * 100);
});

// Pre-save middleware to update progress
goalSchema.pre('save', function(next) {
  if (this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(m => m.isCompleted).length;
    this.progress = Math.round((completedMilestones / this.milestones.length) * 100);
    
    // Auto-complete goal if all milestones are completed
    if (this.progress === 100 && this.status === 'active') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
  next();
});

// Method to add milestone
goalSchema.methods.addMilestone = function(milestoneData) {
  const order = this.milestones.length + 1;
  this.milestones.push({ ...milestoneData, order });
  return this.save();
};

// Method to complete milestone
goalSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.isCompleted = true;
    milestone.completedAt = new Date();
    return this.save();
  }
  throw new Error('Milestone not found');
};

// Method to calculate estimated completion date
goalSchema.methods.getEstimatedCompletionDate = function() {
  if (this.milestones.length === 0) return null;
  
  const remainingDays = this.milestones
    .filter(m => !m.isCompleted)
    .reduce((total, m) => total + m.estimatedDays, 0);
  
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + remainingDays);
  return completionDate;
};

// Exclude deleted goals by default
goalSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Goal', goalSchema);