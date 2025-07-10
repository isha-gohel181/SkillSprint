const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getTasks,
  getTask,
  completeTask,
  getTodayTasks,
  getUpcomingTasks,
} = require("../controllers/taskController");

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Task routes
router.get("/", getTasks);
router.get("/today", getTodayTasks);
router.get("/upcoming", getUpcomingTasks);
router.get("/:id", getTask);
router.put("/:id/complete", completeTask);

module.exports = router;
