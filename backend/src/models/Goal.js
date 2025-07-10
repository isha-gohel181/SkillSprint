const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk user ID
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g., "Programming", "Communication"
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    targetDuration: { type: Number, required: true }, // in days
    status: {
      type: String,
      enum: ["Active", "Completed", "Paused"],
      default: "Active",
    },
    milestones: [
      {
        title: String,
        description: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    aiGenerated: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
goalSchema.index({ userId: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ category: 1 });

module.exports = mongoose.model("Goal", goalSchema);
