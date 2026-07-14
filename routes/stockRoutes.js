const express = require("express");

const router = express.Router();

const { createStock, getStocks } = require("../controllers/stockController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// admin only
router.post("/", protect, isAdmin, createStock);

// logged in users
router.get("/", protect, getStocks);

module.exports = router;
