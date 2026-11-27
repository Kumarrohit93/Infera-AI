
const express = require("express");
const authenticate = require("../middleware/authenticate");
const { askQuestion, askQuestionStream } = require("../Controllers/rag.controller.js");

const router = express.Router();

router.post("/ask", authenticate, askQuestion);
router.post("/ask/stream", authenticate, askQuestionStream);

module.exports = router;
