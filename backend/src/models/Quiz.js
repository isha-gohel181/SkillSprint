const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
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
    questions: [{
      question: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'short_answer'],
        required: true,
      },
      options: [{
        text: String,
        isCorrect: Boolean,
      }],
      correctAnswer: String, // For short answer questions
      explanation: String,
      points: {
        type: Number,
        default: 1,
      },
    }],
    totalPoints: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      required: true,
    },
    timeLimit: {
      type: Number, // in minutes
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    answers: [{
      questionIndex: Number,
      answer: String, // Selected option or text answer
      isCorrect: Boolean,
      points: Number,
    }],
    score: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number, // in minutes
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizSchema.index({ goalId: 1 });
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, completedAt: -1 });

const Quiz = mongoose.model("Quiz", quizSchema);
const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };