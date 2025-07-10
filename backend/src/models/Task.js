const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["Reading", "Video", "Practice", "Quiz", "Project"],
      required: true,
    },
    estimatedTime: { type: Number, required: true }, // in minutes
    resources: [
      {
        type: String, // 'video', 'article', 'book'
        title: String,
        url: String,
        description: String,
      },
    ],
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ userId: 1 });
taskSchema.index({ goalId: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ completed: 1 });

module.exports = mongoose.model("Task", taskSchema);
