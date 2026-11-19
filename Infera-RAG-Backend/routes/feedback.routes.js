const express = require("express");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const {
  saveFeedback,
  listFeedback,
  getMonitoring,
  getDashboardAnalytics,
} = require("../controllers/feedback.controller");

const router = express.Router();
router.post("/:id", authenticate, saveFeedback);
router.get("/admin/list", authenticate, requireRole("admin"), listFeedback);
router.get("/admin/monitoring", authenticate, requireRole("admin"), getMonitoring);
router.get("/admin/analytics/dashboard", authenticate, requireRole("admin"), getDashboardAnalytics);

module.exports = router;
