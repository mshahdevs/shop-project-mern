
const express = require("express");
const router = express.Router();    
const {protect} =  require("../middleware/authMiddleware");
const { addOrderItems, getOrderById } =require( "../controller/orderController");
router.post("/", protect, addOrderItems);
router.route("/:id").get(protect, getOrderById);
module.exports = router;