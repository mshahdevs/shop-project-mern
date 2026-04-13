const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");
const Order = require("../models/orderModel");
const {protect} = require("../middleware/authMiddleware");

// @desc Create payment intent for Stripe
// @route POST /api/payments/create-payment-intent
// @access Private
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const { totalPrice } = req.body;
    
    if (typeof totalPrice !== "number" || totalPrice <= 0) {
      return res.status(400).json({ message: "Valid totalPrice must be provided" });
    }

    const amount = Math.round(totalPrice * 100); // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc Retrieve payment intent
// @route GET /api/payments/payment-intent/:intentId
// @access Private
router.get("/payment-intent/:intentId", protect, async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.intentId);
    res.json(paymentIntent);
  } catch (error) {
    console.error("Retrieve Payment Intent Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc Confirm payment (optional - for additional validation)
// @route POST /api/payments/confirm-payment
// @access Private
router.post("/confirm-payment", protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      res.json({
        success: true,
        message: "Payment confirmed successfully",
        paymentIntent,
      });
    } else if (paymentIntent.status === "processing") {
      res.json({
        success: false,
        message: "Payment is being processed",
        paymentIntent,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment failed with status: ${paymentIntent.status}`,
        paymentIntent,
      });
    }
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;