const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const plotController = require("../controllers/plotController");

const router = express.Router();

// Public routes
router.get("/update-status", plotController.updatePlotStatus);
router.get("/", plotController.getPlots);

// Protected routes
router.get("/user", protect(["user", "owner"]), plotController.getUserPlots);
router.get("/agent", protect(["agent", "owner"]), plotController.getAgentPlots);
router.get("/owner", protect(["owner"]), plotController.getAllPlots);
router.post("/book", protect(), plotController.bookPlots);
router.post("/details", protect(), plotController.plotDetails);

module.exports = router;
