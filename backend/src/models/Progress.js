const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    date: { type: Date, required: true },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    streak: { type: Number, default: 0 },
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
progressSchema.index({ userId: 1 });
progressSchema.index({ goalId: 1 });
progressSchema.index({ date: 1 });

module.exports = mongoose.model("Progress", progressSchema);
