
const express = require("express");
const router = express.Router();    
const {protect} =  require("../middleware/authMiddleware");
const { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders } =require( "../controller/orderController");
router.post("/", protect, addOrderItems);
router.get("/myorders", protect, getMyOrders);
router.route("/:id").get(protect, getOrderById);
module.exports = router;