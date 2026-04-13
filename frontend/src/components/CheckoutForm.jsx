import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Button } from "react-bootstrap";
import Message from "./Message";

const CheckoutForm = ({ clientSecret, orderData, onPaymentSuccess }) => {
  const stripe = useStripe();
  const { userInfo } = useSelector((state) => state.userLogin);
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError("Stripe not loaded. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm card payment
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userInfo?.name || "Anonymous",
            email: userInfo?.email || "",
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment success → pass to placeorder
        onPaymentSuccess(paymentIntent);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        setError("Payment requires additional authentication. Please check your card.");
        setLoading(false);
      } else {
        setError("Payment failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred during payment.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Col>
          <label className="mb-2" style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>
            Card Details
          </label>
          <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
            <CardElement options={cardElementOptions} onChange={handleCardChange} />
          </div>
        </Col>
      </Row>

      {error && <Message variant="danger" children={error} />}

      <Button
        className="btn btn-primary mt-3 w-100"
        type="submit"
        disabled={!stripe || !elements || loading || !cardComplete}
      >
        {loading ? "Processing..." : `Pay $${orderData?.totalPrice?.toFixed(2) || "0.00"}`}
      </Button>
    </form>
  );
};

export default CheckoutForm;