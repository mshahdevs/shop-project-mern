# PayPal Integration Setup Guide

## Overview
This guide will help you set up PayPal integration in your MERN e-commerce application. PayPal payments are now fully integrated alongside Stripe.

## Step 1: Get PayPal Credentials

### Create a PayPal Developer Account
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Sign in with your PayPal account (or create one)
3. Go to **Apps & Credentials**
4. Select **Sandbox** (for testing)
5. Click **Create App** under REST API apps
6. Name your app and click **Create App**

### Get Your Credentials
1. Under **Sandbox** > **Apps & Credentials**, you'll see your app
2. Click **Show** under **Client ID** → Copy this value
3. Click **Show** under **Secret** → Copy this value

## Step 2: Update Environment Variables

### Backend (.env file)
Update your `.env` file in the backend folder with:

```
PAYPAL_CLIENT_ID=your_client_id_from_paypal
PAYPAL_SECRET=your_secret_from_paypal
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Example:**
```
PAYPAL_CLIENT_ID=AWxBEufI8pxA5z7kP9qZ3mN1vB2xC4dE5fG6hI7jK8lM9nO0pQ
PAYPAL_SECRET=EHfL1mN2oP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP
```

## Step 3: Testing PayPal Payments

### Test Credentials (Sandbox)
PayPal provides test buyer and seller accounts:

1. In **Sandbox Accounts** (under **Accounts**), you'll find:
   - **Buyer Account** - Use this for testing purchases
   - **Seller Account** - Your business account

2. Default test account credentials:
   - **Email**: Usually ends with `-buyer@personal.example.com`
   - **Password**: Found in account details

### Test Card Numbers
You can also use test credit cards in sandbox:
- **Visa**: 4111 1111 1111 1111
- **Expiry**: Any future date (12/25)
- **CVV**: Any 3 digits

## Step 4: How It Works

### User Flow:
1. User selects **PayPal** as payment method
2. User proceeds to **Place Order**
3. **PayPal Button** appears
4. User clicks **PayPal button**
5. Redirected to PayPal login (sandbox or live)
6. Confirms payment
7. Returns to app and order is created

### Backend Flow:
1. **Frontend** → Request to `/api/payments/paypal/create-order`
   - Backend creates PayPal order
   - Returns PayPal Order ID

2. **Frontend** → PayPal processes payment (user logs in, confirms)

3. **Frontend** → Request to `/api/payments/paypal/capture-payment`
   - Backend captures the payment
   - Returns payment confirmation

4. **Frontend** → Creates order with payment details

## Step 5: Endpoints Reference

### Create PayPal Order
```
POST /api/payments/paypal/create-order
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {userToken}

Body:
{
  "totalPrice": 149.99,
  "itemsPrice": 129.99,
  "shippingPrice": 10.00,
  "taxPrice": 10.00
}

Response:
{
  "id": "2GG95646H26850434",
  "status": "CREATED"
}
```

### Capture PayPal Payment
```
POST /api/payments/paypal/capture-payment
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {userToken}

Body:
{
  "orderId": "2GG95646H26850434"
}

Response:
{
  "id": "3C679361940373720",
  "status": "COMPLETED",
  "email_address": "buyer@example.com",
  "update_time": "2026-04-17T12:34:56Z"
}
```

### Get PayPal Client ID (Frontend only)
```
GET /api/payments/paypal-client-id

Response:
{
  "clientId": "AWxBEufI8pxA5z7kP9qZ3mN1vB2xC4dE5fG6hI7jK8lM9nO0pQ"
}
```

## Step 6: Switching Between Sandbox and Production

### Development (Sandbox):
- Set `NODE_ENV=development` in `.env`
- Use Sandbox Client ID and Secret
- Use test accounts for testing

### Production (Live):
- Set `NODE_ENV=production` in `.env`
- Get Live Client ID and Secret from PayPal Dashboard
- Switch to **Live** tab in Developer Dashboard
- Remove test prefixes

## File Changes Made:

1. **Backend**:
   - Updated `/backend/routes/paymentRoutes.js` - Added PayPal endpoints
   - Updated `/backend/.env` - Added PayPal credentials

2. **Frontend**:
   - Created `/frontend/src/components/PayPalButton.jsx` - PayPal button component
   - Updated `/frontend/src/components/screens/PlaceOrderScreen.jsx` - Added PayPal support

3. **Installed**:
   - Backend: `axios` (for PayPal API calls)

## Troubleshooting

### PayPal button not showing?
- Check browser console for errors
- Verify `PAYPAL_CLIENT_ID` is set correctly in `.env`
- Ensure frontend can reach backend at `/api/payments/paypal-client-id`

### Payment capture fails?
- Check backend logs for error messages
- Verify credentials are correct
- Ensure order was created successfully first

### CORS errors?
- Make sure `FRONTEND_URL` is correct in `.env`
- Check backend CORS configuration

## Next Steps

1. ✅ Add PayPal credentials to `.env`
2. ✅ Restart backend server
3. ✅ Test with PayPal Sandbox
4. ✅ Try placing order with PayPal
5. ✅ When ready, switch to Production credentials

---

Need help? Check the PayPal integration code in:
- Backend: `backend/routes/paymentRoutes.js`
- Frontend: `frontend/src/components/PayPalButton.jsx`
