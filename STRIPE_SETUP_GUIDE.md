# Stripe Payment Flow Setup Guide

## Overview
This guide explains the complete Stripe payment integration for your MERN shop project. The setup includes frontend Stripe checkout, backend payment processing, and webhook handling.

---

## Backend Setup

### 1. Environment Variables

Add the following to your `backend/.env` file:

```env
# Stripe API Keys
STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

**Where to get these:**
- Go to [Stripe Dashboard](https://dashboard.stripe.com)
- Navigate to **API Keys** section
- Copy your **Publishable Key** and **Secret Key** (test keys for development)
- For webhook secret, go to **Webhooks** and add an endpoint

### 2. Backend Files Modified/Created

#### Updated Files:
- **`backend/config/stripe.js`** - Already configured to use your STRIPE_SECRET_KEY
- **`backend/routes/paymentRoutes.js`** - Enhanced with:
  - POST `/api/payments/create-payment-intent` - Creates payment intent
  - GET `/api/payments/payment-intent/:intentId` - Retrieves payment intent
  - POST `/api/payments/confirm-payment` - Confirms payment status
  
- **`backend/index.js`** - Added:
  - Stripe webhook endpoint at `POST /api/payments/webhook`
  - Raw body parser for webhook signature verification

- **`backend/models/orderModel.js`** - Added:
  - `itemsPrice` field for better order tracking

#### New Files:
- **`backend/webhooks/stripeWebhook.js`** - Handles Stripe webhook events:
  - `payment_intent.succeeded` - Payment successful
  - `payment_intent.payment_failed` - Payment failed
  - `payment_intent.canceled` - Payment cancelled
  - `charge.refunded` - Charge refunded

### 3. Payment Flow (Backend)

```
1. User selects Stripe payment method
2. Frontend requests payment intent from /api/payments/create-payment-intent
3. Backend creates payment intent and returns clientSecret
4. Frontend uses clientSecret for card payment
5. On success, frontend creates order via /api/orders
6. Stripe sends webhook to /api/payments/webhook (optional verification)
```

---

## Frontend Setup

### 1. Environment Variables

Add to your `frontend/.env`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY
```

**Note:** Currently the Stripe key is hardcoded in `App.jsx`. Update it to use environment variable:

```javascript
// In App.jsx
import {loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
```

### 2. Frontend Files Modified/Created

#### Updated Files:
- **`frontend/src/components/screens/PaymentScreen.jsx`**
  - Uncommented and enabled Stripe option
  - Now allows users to select between PayPal and Stripe

- **`frontend/src/components/CheckoutForm.jsx`**
  - Enhanced with better error handling
  - Card element styling
  - Loading states and validation
  - User billing details auto-fill

- **`frontend/src/components/screens/PlaceOrderScreen.jsx`**
  - Integrated Stripe payment flow
  - Shows payment form only for Stripe method
  - Handles both PayPal and Stripe payment methods
  - Creates order only after successful payment

- **`frontend/src/actions/orderActions.js`**
  - Added `createPaymentIntent()` action for creating Stripe payment intents
  - Integrated with Redux state management

- **`frontend/src/constants/orderConstant.js`**
  - Added payment intent constants:
    - `PAYMENT_INTENT_REQUEST`
    - `PAYMENT_INTENT_SUCCESS`
    - `PAYMENT_INTENT_FAIL`
    - `PAYMENT_INTENT_RESET`

- **`frontend/src/reducers/orderReducers.js`**
  - Added `paymentIntentReducer` for payment intent state management

- **`frontend/src/store.js`**
  - Integrated `paymentIntentReducer` into Redux store

### 3. Payment Flow (Frontend)

```
1. User goes to checkout → Payment Screen
2. User selects "Stripe" payment method
3. Navigate to Place Order Screen
4. User clicks "Place Order"
5. Component fetches payment intent from backend
6. Checkout form appears with Stripe card element
7. User enters card details
8. On form submit:
   - Card is confirmed via stripe.confirmCardPayment()
   - If successful, order is created in backend
   - User is redirected to order confirmation page
```

---

## Testing Stripe Payments

### Test Cards
Use these Stripe test cards for development:

```
Visa:
Number: 4242 4242 4242 4242
Exp: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)

Test authentication required:
Number: 4000 0025 0000 3155
Exp: Any future date
CVC: Any 3 digits

Declined card:
Number: 4000 0000 0000 0002
Exp: Any future date
CVC: Any 3 digits
```

### Testing Steps

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Add items to cart and proceed to checkout**

3. **On Payment Screen:**
   - Select "Stripe" option
   - Click Continue

4. **On Place Order Screen:**
   - Review order summary
   - Click "Place Order"
   - Payment form will appear

5. **Enter payment details:**
   - Use one of the test card numbers above
   - Enter any future expiration date
   - Enter any 3-digit CVC
   - Click "Pay $[amount]"

6. **Verify payment:**
   - Success: You'll see order confirmation
   - Failure: Error message will display

### Check Payment Status in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Payments** section
3. You'll see all test transactions with their status

---

## Payment Intent API Reference

### Create Payment Intent
```
POST /api/payments/create-payment-intent
Headers: Authorization: Bearer {token}
Body: {
  "totalPrice": 99.99
}
Response: {
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

### Retrieve Payment Intent
```
GET /api/payments/payment-intent/:intentId
Headers: Authorization: Bearer {token}
Response: {
  "id": "pi_...",
  "status": "succeeded",
  "amount": 9999,
  "currency": "usd",
  ...
}
```

### Confirm Payment
```
POST /api/payments/confirm-payment
Headers: Authorization: Bearer {token}
Body: {
  "paymentIntentId": "pi_..."
}
Response: {
  "success": true,
  "message": "Payment confirmed successfully",
  "paymentIntent": {...}
}
```

---

## Webhook Setup (Production)

### Local Testing with Stripe CLI

1. **Install Stripe CLI:**
   - Download from [Stripe CLI](https://stripe.com/docs/stripe-cli)

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward events to local webhook:**
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

4. **Get webhook signing secret:**
   - Copy the signing secret from the CLI output
   - Add to `backend/.env` as `STRIPE_WEBHOOK_SECRET`

5. **Test webhook:**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### Production Webhook Setup

1. Go to [Stripe Dashboard Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the signing secret
6. Add to your production `.env` file

---

## Order Data Structure

### Order Model Fields

```javascript
{
  user: ObjectId,
  orderItems: [{
    name: String,
    qty: Number,
    image: String,
    price: Number,
    product: ObjectId
  }],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: String ('Stripe' or 'PayPal'),
  paymentResult: {
    id: String,              // Stripe Payment Intent ID
    status: String,          // 'succeeded', 'processing', etc.
    update_time: String,
    email_address: String
  },
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** in production
4. **Hash and store** payment information securely
5. **Use HTTPS** in production
6. **Don't store full card details** - Stripe handles this
7. **Implement rate limiting** on payment endpoints
8. **Validate all inputs** before processing payments

---

## Common Issues & Troubleshooting

### Issue: "Stripe is not defined"
**Solution:** Make sure Stripe library is imported:
```javascript
import { loadStripe } from '@stripe/stripe-js';
```

### Issue: "Payment Intent could not be created"
**Solution:** 
- Verify `STRIPE_SECRET_KEY` is correct in `.env`
- Check that amount is a positive number
- Restart backend server after changing `.env`

### Issue: "Webhook verification failed"
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches your endpoint secret
- Check raw body is being received (JSON parsing issue)
- Re-generate webhook secret if needed

### Issue: "Card declined"
**Solution:**
- For test cards, use the official Stripe test cards
- Check card number, expiration, and CVC
- Verify the test card is appropriate for your use case

### Issue: "CORS error when making payment"
**Solution:**
- Ensure backend is running on correct port
- Check frontend API endpoint configuration
- Verify proxy settings in `vite.config.js` or `package.json`

---

## Next Steps

1. **Add error logging** for failed payments
2. **Implement email notifications** for successful orders
3. **Add retry logic** for failed payments
4. **Implement refund functionality**
5. **Add payment status tracking** in dashboard
6. **Set up Stripe analytics** for business insights
7. **Implement 3D Secure** for additional security

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [React Stripe Documentation](https://stripe.com/docs/stripe-js/react)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Webhook Signature Verification](https://stripe.com/docs/webhooks/signatures)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)

---

## Support

For issues or questions:
1. Check the Stripe Dashboard for transaction details
2. Review server logs for error messages
3. Check browser console for frontend errors
4. Refer to Stripe documentation
5. Use Stripe CLI for webhook testing

