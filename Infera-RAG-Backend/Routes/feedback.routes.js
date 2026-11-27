const express = require("express");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const {
  saveFeedback,
  listFeedback,
  replyToFeedback,
  getMyFeedback,
  getMonitoring,
  getDashboardAnalytics,
} = require("../Controllers/feedback.controller");

const router = express.Router();

// Member routes
router.post("/:id", authenticate, saveFeedback);            // Submit rating on a specific AI message
router.get("/my", authenticate, getMyFeedback);             // Member views their own feedback + admin replies

// Admin routes
router.get("/admin/list", authenticate, requireRole("admin"), listFeedback);
router.post("/admin/reply/:id", authenticate, requireRole("admin"), replyToFeedback);
router.get("/admin/monitoring", authenticate, requireRole("admin"), getMonitoring);
router.get("/admin/analytics/dashboard", authenticate, requireRole("admin"), getDashboardAnalytics);

module.exports = router;
