const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validateProgressData } = require("../middleware/validation");
const {
  getUserProgress,
  getGoalProgress,
  logProgress,
  getStats,
} = require("../controllers/progressController");

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Progress routes
router.get("/", getUserProgress);
router.get("/stats", getStats);
router.get("/:goalId", getGoalProgress);
router.post("/", validateProgressData, logProgress);

module.exports = router;
