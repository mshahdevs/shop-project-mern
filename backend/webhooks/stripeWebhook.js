const stripe = require("../config/stripe");
const Order = require("../models/orderModel");

// Stripe webhook secret - should be in .env file
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Middleware to handle Stripe webhooks
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed:`, err.message);
    return res.sendStatus(400);
  }

  // Handle different event types
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;

    case "payment_intent.canceled":
      await handlePaymentIntentCanceled(event.data.object);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log(`✅ Payment Intent ${paymentIntent.id} succeeded`);

    // Find order by payment intent ID and update status
    // The order is already created when the user clicks "Place Order"
    // but we can use this to verify payment success
    
    // In this case, payment status is typically updated on the frontend
    // when the checkout form confirms the payment
    // This webhook is additional confirmation for backend validation
    
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log(`❌ Payment Intent ${paymentIntent.id} failed`);
    console.log("Failure reason:", paymentIntent.last_payment_error);

    // Optionally, you can mark the order as requiring payment retry
    // or send notification to the user

  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
  }
}

// Handle cancelled payment intent
async function handlePaymentIntentCanceled(paymentIntent) {
  try {
    console.log(`🚫 Payment Intent ${paymentIntent.id} was canceled`);

    // Optionally, update order status or mark as cancelled

  } catch (error) {
    console.error("Error handling payment_intent.canceled:", error);
  }
}

// Handle refunded charges
async function handleChargeRefunded(charge) {
  try {
    console.log(`💰 Charge ${charge.id} was refunded`);
    console.log("Amount refunded:", charge.amount_refunded);

    // Optionally, update order status to show refund

  } catch (error) {
    console.error("Error handling charge.refunded:", error);
  }
}

// Export as middleware for Express
const stripeWebhookMiddleware = (req, res, next) => {
  if (req.path === "/webhook") {
    handleStripeWebhook(req, res);
  } else {
    next();
  }
};

module.exports = {
  handleStripeWebhook,
  stripeWebhookMiddleware,
};