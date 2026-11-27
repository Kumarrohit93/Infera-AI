const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  createConversation,
  listConversations,
  getConversationMessages,
  deleteConversation,
} = require("../Controllers/conversation.controller");

const router = express.Router();

router.post("/", authenticate, createConversation);
router.get("/", authenticate, listConversations);
router.get("/:id/messages", authenticate, getConversationMessages);
router.delete("/:id", authenticate, deleteConversation);

module.exports = router;
