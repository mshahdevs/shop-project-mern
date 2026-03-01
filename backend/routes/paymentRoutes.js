const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");
const Order = require("../models/orderModel");
const {protect} = require("../middleware/authMiddleware");

router.post("/create-payment-intent", protect, async (req,res) =>{
    try{
     const { orderItems,paymentMethod,shippingAddress,shippingPrice,taxPrice,totalPrice } = req.body;
     const amount = Math.round(totalPrice * 100);

     const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency:"usd",
     });

     const order = await Order.create({
        user:req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
     });

     res.status(201).json({
        clientSecret: paymentIntent.client_secret,
        orderId: order._id,

     })

    } catch(error){
        res.status(500).json({ message: error.message });



    }
})

module.exports = router;