const Product = require("../models/Product");

// create product -Admin
const createProduct = async (req, res) => {
  try {
    const { name, sku } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        message: "Name and SKU are required",
      });
    }

    const existingProduct = await Product.findOne({
      sku,
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "SKU already exists",
      });
    }

    const product = await Product.create({
      name,
      sku,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
};
