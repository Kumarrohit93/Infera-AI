
const express = require("express");
const authenticate = require("../middleware/authenticate");
const { askQuestion } = require("../Controllers/rag.controller.js");

const router = express.Router();

router.post("/ask", authenticate, askQuestion);

module.exports = router;
