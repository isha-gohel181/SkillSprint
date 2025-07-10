const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    userId: { type: String, required: true },
    milestone: String,
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String,
      },
    ],
    userAnswers: [
      {
        questionIndex: Number,
        answer: String,
        correct: Boolean,
      },
    ],
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    completedAt: Date,
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
quizSchema.index({ userId: 1 });
quizSchema.index({ goalId: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
