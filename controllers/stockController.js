const Stock = require("../models/Stock");
const Product = require("../models/Product");
const Store = require("../models/Store");

// create Initial Stock
const createStock = async (req, res) => {
  try {
    const { productId, storeId, quantity } = req.body;

    if (!productId || !storeId || quantity == null) {
      return res.status(400).json({
        message: "Product, store and quantity are required",
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    const product = await Product.findById(productId);
    const store = await Store.findById(storeId);

    if (!product || !store) {
      return res.status(404).json({
        message: "Product or Store not found",
      });
    }

    const existingStock = await Stock.findOne({
      product: productId,
      store: storeId,
    });

    if (existingStock) {
      return res.status(400).json({
        message: "Stock already exists for this product in this store",
      });
    }

    const stock = await Stock.create({
      product: productId,
      store: storeId,
      quantity,
    });

    res.status(201).json({
      message: "Stock created successfully",
      stock,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get All Stock
const getStocks = async (req, res) => {
  try {
    const { threshold } = req.query;

    let query = {};

    if (threshold) {
      query.quantity = { $lte: Number(threshold) };
    }

    const stocks = await Stock.find(query)
      .populate("product", "name sku")
      .populate("store", "name location");

    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStock,
  getStocks,
};
