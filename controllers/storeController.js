const Store = require("../models/Store");

// create Store -Admin
const createStore = async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        message: "Name and location are required",
      });
    }

    const existingStore = await Store.findOne({
      name,
      location,
    });

    if (existingStore) {
      return res.status(400).json({
        message: "Store already exists",
      });
    }

    const store = await Store.create({
      name,
      location,
    });

    res.status(201).json({
      message: "Store created successfully",
      store,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get all stores
const getStores = async (req, res) => {
  try {
    const stores = await Store.find();

    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStore,
  getStores,
};
