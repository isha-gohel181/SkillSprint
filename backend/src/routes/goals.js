const express = require("express");
const Goal = require("../models/Goal");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/goals - Get all goals for the authenticated user
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find({ 
      userId: req.auth.userId,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch goals" 
    });
  }
});

// GET /api/goals/:id - Get a specific goal
router.get("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.auth.userId,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        error: "Goal not found" 
      });
    }

    res.json({ success: true, goal });
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch goal" 
    });
  }
});

// POST /api/goals - Create a new goal
router.post("/", async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      userId: req.auth.userId,
    };

    const goal = new Goal(goalData);
    await goal.save();

    res.status(201).json({ success: true, goal });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to create goal" 
    });
  }
});

// PUT /api/goals/:id - Update a goal
router.put("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.auth.userId,
        isActive: true
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        error: "Goal not found" 
      });
    }

    res.json({ success: true, goal });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to update goal" 
    });
  }
});

// DELETE /api/goals/:id - Soft delete a goal
router.delete("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.auth.userId,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        error: "Goal not found" 
      });
    }

    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete goal" 
    });
  }
});

// PATCH /api/goals/:id/progress - Update goal progress
router.patch("/:id/progress", async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ 
        success: false, 
        error: "Progress must be between 0 and 100" 
      });
    }

    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.auth.userId,
        isActive: true
      },
      { 
        progress,
        status: progress === 100 ? 'completed' : 'in_progress'
      },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        error: "Goal not found" 
      });
    }

    res.json({ success: true, goal });
  } catch (error) {
    console.error("Error updating goal progress:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to update goal progress" 
    });
  }
});

module.exports = router;