const express = require("express");

const router = express.Router();

const {
  createStock,
  getStocks,
  adjustStock,
  transferStock,
} = require("../controllers/stockController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// admin only
router.post("/", protect, isAdmin, createStock, );
//for not going negative quantity
router.patch("/adjust", protect, isAdmin, adjustStock);
//auto stoke transfer,store-store stoke moving
router.post("/transfer", protect, isAdmin, transferStock);
// logged in users
router.get("/", protect, getStocks);

module.exports = router;
