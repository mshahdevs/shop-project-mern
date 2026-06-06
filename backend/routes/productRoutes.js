const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
} = require('../controller/productController');
const { protect, admin } = require('../middleware/authMiddleware');
router.get('/', getProducts);
router.route('/:id').get(getProductById).delete(protect, admin, deleteProduct);

module.exports = router;
