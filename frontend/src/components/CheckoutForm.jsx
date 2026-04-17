import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import React from "react";
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
  const [elementsReady, setElementsReady] = useState(false);

  // Check if Elements are ready
  React.useEffect(() => {
    if (stripe && elements) {
      setElementsReady(true);
      console.log("✓ Stripe & Elements Ready");
    }
  }, [stripe, elements]);

  // Debug logging
  React.useEffect(() => {
    console.log("CheckoutForm State:", {
      elementsReady,
      cardComplete,
      loading,
      clientSecretExists: !!clientSecret,
      stripeLoaded: !!stripe,
      elementsLoaded: !!elements,
    });
  }, [elementsReady, cardComplete, loading, clientSecret, stripe, elements]);

  const cardElementOptions = {
    hidePostalCode: false,
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d",
        fontFamily: '"helvetica neue", helvetica, arial, sans-serif',
        fontSmoothing: "antialiased",
        "::placeholder": {
          color: "#aab7c4",
          fontWeight: "500",
        },
        ":-webkit-autofill": {
          color: "#32325d",
        },
      },
      invalid: {
        color: "#fa755a",
        "::placeholder": {
          color: "#ffcdd2",
        },
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
      {!elementsReady && (
        <Message variant="info"> Loading payment form...</Message>
      )}
      
      <Row className="mb-3">
        <Col>
          <label className="mb-2" style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#333" }}>
            Card Details
            {!cardComplete && elementsReady && <span style={{ color: "#dc3545", marginLeft: "4px" }}>*</span>}
          </label>
          <div style={{ 
            padding: "12px 15px", 
            border: cardComplete ? "2px solid #28a745" : "1px solid #ced4da", 
            borderRadius: "4px",
            backgroundColor: "#fff",
            minHeight: "56px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}>
            {elementsReady ? (
              <div style={{ width: "100%" }}>
                <CardElement 
                  options={cardElementOptions} 
                  onChange={handleCardChange}
                />
              </div>
            ) : (
              <span style={{ color: "#999", fontSize: "14px" }}>Initializing Stripe...</span>
            )}
          </div>
          {cardComplete && (
            <small style={{ color: "#28a745", fontSize: "12px", marginTop: "4px", display: "block" }}>
              ✓ Card details valid
            </small>
          )}
          {elementsReady && !cardComplete && (
            <small style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>
              Please enter your card details
            </small>
          )}
        </Col>
      </Row>

      {error && <Message variant="danger" children={error} />}

      <Button
        className="btn btn-primary mt-3 w-100"
        type="submit"
        disabled={!elementsReady || loading || !cardComplete}
      >
        {loading ? "Processing Payment..." : `Pay $${orderData?.totalPrice?.toFixed(2) || "0.00"}`}
      </Button>
    </form>
  );
};

export default CheckoutForm;