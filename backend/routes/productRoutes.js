const express = require("express");
// const products = require("../data/products");
const router = express.Router();
const Product = require("../models/productModel");
router.get("/", async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

module.exports = router;
