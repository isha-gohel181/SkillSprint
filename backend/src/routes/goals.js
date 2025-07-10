const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { validateGoalData } = require("../middleware/validation");
const {
  createGoal,
  getUserGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  completeMilestone,
} = require("../controllers/goalController");

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Goal routes
router.post("/", validateGoalData, createGoal);
router.get("/", getUserGoals);
router.get("/:id", getGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);
router.post("/:id/milestone", completeMilestone);

module.exports = router;
