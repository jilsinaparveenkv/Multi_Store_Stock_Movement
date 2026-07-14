const express = require("express");
const router = express.Router();

const { createStore, getStores } = require("../controllers/storeController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// admin create Store
router.post("/", protect, isAdmin, createStore);

// logged in users can view stores
router.get("/", protect, getStores);

module.exports = router;
