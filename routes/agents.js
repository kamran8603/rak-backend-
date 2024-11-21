const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createAgent } = require("../controllers/agentController");
const { getAllAgents } = require("../controllers/agentController");

// Create a new agent
router.post("/agents", protect(["owner"]), createAgent);
router.get('/profiles',  protect(["owner"]), getAllAgents);

module.exports = router;
