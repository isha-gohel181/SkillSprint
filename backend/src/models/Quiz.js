const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'true-false', 'fill-in-blank', 'essay'],
  },
  options: [{
    type: String,
    maxlength: 200,
    trim: true,
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, or boolean
    required: true,
  },
  explanation: {
    type: String,
    maxlength: 300,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  points: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  order: {
    type: Number,
    required: true,
    min: 1,
  },
});

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk user ID
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number, // seconds
      default: 0,
    },
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  totalCorrect: {
    type: Number,
    required: true,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
  },
  timeSpent: {
    type: Number, // total time in seconds
    required: true,
    min: 0,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  feedback: {
    type: String,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk user ID (creator)
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
    instructions: {
      type: String,
      maxlength: 500,
      default: 'Answer all questions to the best of your ability.',
    },
    questions: [questionSchema],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    timeLimit: {
      type: Number, // time limit in minutes
      min: 1,
      max: 180, // max 3 hours
      default: 30,
    },
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },
    maxAttempts: {
      type: Number,
      min: 1,
      max: 10,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    attempts: [quizAttemptSchema],
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
      topic: String,
    },
    analytics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      passRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      averageTimeSpent: {
        type: Number,
        default: 0,
      },
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
quizSchema.index({ userId: 1, goalId: 1 });
quizSchema.index({ goalId: 1, isActive: 1 });
quizSchema.index({ category: 1, difficulty: 1 });
quizSchema.index({ isPublic: 1, isActive: 1 });

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual for average difficulty
quizSchema.virtual('averageDifficulty').get(function() {
  if (this.questions.length === 0) return 'medium';
  
  const difficultyValues = { easy: 1, medium: 2, hard: 3 };
  const totalDifficulty = this.questions.reduce((total, question) => {
    return total + (difficultyValues[question.difficulty] || 2);
  }, 0);
  
  const average = totalDifficulty / this.questions.length;
  if (average <= 1.5) return 'easy';
  if (average <= 2.5) return 'medium';
  return 'hard';
});

// Method to add question
quizSchema.methods.addQuestion = function(questionData) {
  const order = this.questions.length + 1;
  this.questions.push({ ...questionData, order });
  return this.save();
};

// Method to start quiz attempt
quizSchema.methods.startAttempt = function(userId) {
  const userAttempts = this.attempts.filter(attempt => attempt.userId === userId);
  
  if (userAttempts.length >= this.maxAttempts) {
    throw new Error('Maximum attempts reached');
  }

  return {
    quizId: this._id,
    userId,
    questions: this.questions.map(q => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
      order: q.order,
    })),
    timeLimit: this.timeLimit,
    startedAt: new Date(),
  };
};

// Method to submit quiz attempt
quizSchema.methods.submitAttempt = function(userId, answers, timeSpent) {
  const totalQuestions = this.questions.length;
  let totalCorrect = 0;
  
  const processedAnswers = answers.map(answer => {
    const question = this.questions.id(answer.questionId);
    if (!question) {
      throw new Error('Invalid question ID');
    }

    let isCorrect = false;
    if (question.type === 'multiple-choice') {
      isCorrect = parseInt(answer.answer) === parseInt(question.correctAnswer);
    } else if (question.type === 'true-false') {
      isCorrect = Boolean(answer.answer) === Boolean(question.correctAnswer);
    } else {
      // For fill-in-blank and essay, simple string comparison (can be enhanced)
      isCorrect = String(answer.answer).toLowerCase().trim() === 
                  String(question.correctAnswer).toLowerCase().trim();
    }

    if (isCorrect) totalCorrect++;

    return {
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect,
      timeSpent: answer.timeSpent || 0,
    };
  });

  const score = Math.round((totalCorrect / totalQuestions) * 100);
  const passed = score >= this.passingScore;

  const attempt = {
    userId,
    answers: processedAnswers,
    score,
    totalCorrect,
    totalQuestions,
    timeSpent,
    startedAt: new Date(Date.now() - timeSpent * 1000),
    completedAt: new Date(),
    passed,
  };

  this.attempts.push(attempt);
  
  // Update analytics
  this.analytics.totalAttempts = this.attempts.length;
  this.analytics.averageScore = Math.round(
    this.attempts.reduce((sum, att) => sum + att.score, 0) / this.attempts.length
  );
  this.analytics.passRate = Math.round(
    (this.attempts.filter(att => att.passed).length / this.attempts.length) * 100
  );
  this.analytics.averageTimeSpent = Math.round(
    this.attempts.reduce((sum, att) => sum + att.timeSpent, 0) / this.attempts.length
  );

  return this.save().then(() => attempt);
};

// Method to get user's best attempt
quizSchema.methods.getUserBestAttempt = function(userId) {
  const userAttempts = this.attempts.filter(attempt => attempt.userId === userId);
  if (userAttempts.length === 0) return null;
  
  return userAttempts.reduce((best, current) => 
    current.score > best.score ? current : best
  );
};

// Method to get user's attempts count
quizSchema.methods.getUserAttemptsCount = function(userId) {
  return this.attempts.filter(attempt => attempt.userId === userId).length;
};

// Static method to get quizzes by goal
quizSchema.statics.getByGoal = function(goalId, isActive = true) {
  const query = { goalId, isDeleted: false };
  if (isActive !== null) {
    query.isActive = isActive;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get public quizzes
quizSchema.statics.getPublicQuizzes = function(category = null, difficulty = null) {
  const query = { isPublic: true, isActive: true, isDeleted: false };
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  
  return this.find(query)
    .select('-attempts') // Exclude attempts data for privacy
    .sort({ createdAt: -1 });
};

// Exclude deleted quizzes by default
quizSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model('Quiz', quizSchema);