const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");
const Order = require("../models/orderModel");
const {protect} = require("../middleware/authMiddleware");

router.post("/create-payment-intent", protect, async (req,res) =>{
    try{
     // only compute amount from totalPrice; order is created later in
     // /api/orders when the user actually places the order. sending other
     // fields was causing validation errors when they were undefined.
     const { totalPrice } = req.body;
     if (typeof totalPrice !== "number") {
       return res.status(400).json({ message: "totalPrice must be a number" });
     }
     const amount = Math.round(totalPrice * 100);

     const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency:"usd",
     });

     res.status(201).json({
        clientSecret: paymentIntent.client_secret,
     });

    } catch(error){
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;