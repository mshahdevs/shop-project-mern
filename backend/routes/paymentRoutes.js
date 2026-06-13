const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const axios = require('axios');
const Order = require('../models/orderModel');
const { protect } = require('../middleware/authMiddleware');

// PayPal API base URL
const PAYPAL_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`,
    ).toString('base64');

    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data.access_token;
  } catch (error) {
    console.error('PayPal Token Error:', error.message);
    throw error;
  }
};

// @desc Create PayPal order
// @route POST /api/payments/paypal/create-order
// @access Private
router.post('/paypal/create-order', protect, async (req, res) => {
  try {
    const { totalPrice, itemsPrice, shippingPrice, taxPrice } = req.body;

    const accessToken = await getPayPalAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: totalPrice.toString(),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: itemsPrice.toString(),
              },
              shipping: {
                currency_code: 'USD',
                value: shippingPrice.toString(),
              },
              tax_total: {
                currency_code: 'USD',
                value: taxPrice.toString(),
              },
            },
          },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/placeorder`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
        user_action: 'PAY_NOW',
      },
    };

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    res.json({
      id: response.data.id,
      status: response.data.status,
    });
  } catch (error) {
    console.error(
      'PayPal Create Order Error:',
      error.response?.data || error.message,
    );
    res.status(500).json({
      message: 'Error creating PayPal order',
      error: error.response?.data?.message || error.message,
    });
  }
});

// @desc Capture PayPal payment
// @route POST /api/payments/paypal/capture-payment
// @access Private
router.post('/paypal/capture-payment', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'PayPal Order ID is required' });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.status === 'COMPLETED') {
      const transaction = response.data.purchase_units[0].payments.captures[0];
      res.json({
        id: transaction.id,
        status: transaction.status,
        email_address: response.data.payer.email_address,
        update_time: transaction.create_time,
      });
    } else {
      res.status(400).json({
        message: `Payment not completed. Status: ${response.data.status}`,
      });
    }
  } catch (error) {
    console.error(
      'PayPal Capture Error:',
      error.response?.data || error.message,
    );
    res.status(500).json({
      message: 'Error capturing PayPal payment',
      error: error.response?.data?.message || error.message,
    });
  }
});

// Get PayPal Client ID for frontend
router.get('/paypal-client-id', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// @desc Create payment intent for Stripe
// @route POST /api/payments/create-payment-intent
// @access Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    let { totalPrice } = req.body;

    // console.log('Received totalPrice:', totalPrice, 'Type:', typeof totalPrice);

    // Convert to number if it's a string
    totalPrice = Number(totalPrice);

    if (isNaN(totalPrice) || totalPrice <= 0) {
      return res
        .status(400)
        .json({ message: 'Valid totalPrice must be provided' });
    }

    const amount = Math.round(totalPrice * 100); // Convert to cents
    // console.log('Payment amount in cents:', amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc Retrieve payment intent
// @route GET /api/payments/payment-intent/:intentId
// @access Private
router.get('/payment-intent/:intentId', protect, async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      req.params.intentId,
    );
    res.json(paymentIntent);
  } catch (error) {
    console.error('Retrieve Payment Intent Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc Confirm payment (optional - for additional validation)
// @route POST /api/payments/confirm-payment
// @access Private
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        paymentIntent,
      });
    } else if (paymentIntent.status === 'processing') {
      res.json({
        success: false,
        message: 'Payment is being processed',
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
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
