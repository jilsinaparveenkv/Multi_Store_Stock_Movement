const mongoose = require("mongoose");
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
// adjust Stock
const adjustStock = async (req, res) => {
  try {
    const { productId, storeId, quantity } = req.body;

    if (!productId || !storeId || quantity === undefined) {
      return res.status(400).json({
        message: "Product, store and quantity are required",
      });
    }

    if (quantity === 0) {
      return res.status(400).json({
        message: "Quantity cannot be zero",
      });
    }

    let updatedStock;

    // Increase stock
    if (quantity > 0) {
      updatedStock = await Stock.findOneAndUpdate(
        {
          product: productId,
          store: storeId,
        },
        {
          $inc: { quantity: quantity },
        },
        {
          new: true,
        },
      );
    }

    // Decrease stock
    else {
      updatedStock = await Stock.findOneAndUpdate(
        {
          product: productId,
          store: storeId,
          quantity: { $gte: Math.abs(quantity) },
        },
        {
          $inc: { quantity: quantity },
        },
        {
          new: true,
        },
      );
    }

    if (!updatedStock) {
      return res.status(400).json({
        message: "Insufficient stock or stock record not found",
      });
    }

    res.status(200).json({
      message: "Stock adjusted successfully",
      stock: updatedStock,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//auto transfering stoke between stores, store-store stoke moving
const transferStock = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { productId, sourceStoreId, destinationStoreId, quantity } = req.body;

    if (!productId || !sourceStoreId || !destinationStoreId || !quantity) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (quantity <= 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Quantity must be greater than zero",
      });
    }

    if (sourceStoreId === destinationStoreId) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Source and destination store cannot be the same",
      });
    }

    // Ddduct stock from source store
    const sourceStock = await Stock.findOneAndUpdate(
      {
        product: productId,
        store: sourceStoreId,
        quantity: { $gte: quantity },
      },
      {
        $inc: {
          quantity: -quantity,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!sourceStock) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Insufficient stock in source store",
      });
    }

    // add stock to destination store
    let destinationStock = await Stock.findOne({
      product: productId,
      store: destinationStoreId,
    }).session(session);

    if (destinationStock) {
      destinationStock.quantity += quantity;
      await destinationStock.save({ session });
    } else {
      destinationStock = await Stock.create(
        [
          {
            product: productId,
            store: destinationStoreId,
            quantity,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Stock transferred successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStock,
  getStocks,
  adjustStock,
  transferStock,
};
