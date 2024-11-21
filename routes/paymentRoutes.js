const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require("../middleware/authMiddleware");

// Create a new order
router.post("/createOrder", protect(), createOrder);

// Verify payment
router.post("/verifyPayment", protect(), verifyPayment);

module.exports = router;
