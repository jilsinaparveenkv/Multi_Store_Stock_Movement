const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// admin create product
router.post("/", protect, isAdmin, createProduct);

// logged in users view products
router.get("/", protect, getProducts);

module.exports = router;
