
const express = require("express");
const router = express.Router();    
const {protect} =  require("../middleware/authMiddleware");
const { addOrderItems } =require( "../controller/orderController");
router.post("/", protect, addOrderItems);
module.exports = router;