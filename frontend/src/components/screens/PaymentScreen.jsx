import CheckoutSteps from "../CheckoutSteps";
import FormContainer from "../FormContainer";
import { useSelector, useDispatch } from "react-redux";
import { CART_SAVE_PAYMENT_METHOD } from "../../constants/cartConstant";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../CheckoutForm";
import { Row, Col, Card, Alert, Spinner } from "react-bootstrap";

const stripePromise = loadStripe(
  "pk_test_51PTJjMEHU399Ls8ZKijlXdMh3uLOhwJnHezb5wLxLWCmWxoCVrNFk8uLdowJweAUI52MvnEEPnmKDw4GAmxpoZeN00TijGwERD"
);

const PaymentScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.userLogin);
  const { shippingAddress, cartItems, totalPrice, paymentMethod } = cart;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // make sure prices are calculated locally; these values are what we send to
  // the backend for order creation (currency dollars) while stripeAmount is
  // only used when talking to Stripe.
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 100;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrices = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));
  const stripeAmount = Math.round(totalPrices * 100); // e.g., 929.99 → 92999 cents

  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null);

  // redirect if not logged in
  useEffect(() => {
    if (!userInfo) navigate("/login");
  }, [userInfo, navigate]);

  // redirect if shipping info missing
  useEffect(() => {
    if (!shippingAddress.address) navigate("/shipping");
  }, [shippingAddress, navigate]);

  // dispatch a default payment method if none chosen. the order model
  // requires it so we'll just call it "Stripe" here.
  useEffect(() => {
    if (!paymentMethod) {
      dispatch({ type: CART_SAVE_PAYMENT_METHOD, payload: "Stripe" });
    }
  }, [dispatch, paymentMethod]);

  // create PaymentIntent on the server; the backend no longer creates the
  // order (that happens in PlaceOrderScreen), hence we only send the price
  // and a few other values. `totalPrice` is in dollars while stripeAmount is
  // the same number in cents for Stripe's API.
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        if (!userInfo) return;

        const res = await fetch("/api/payments/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({
            totalPrice: totalPrices,
          }),
        });

        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message);
      }
    };

    createPaymentIntent();
  }, [totalPrices, userInfo]);

  if (!clientSecret)
    return (
      <FormContainer>
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px", gap: "1.5rem" }}>
          <Spinner animation="border" role="status" className="text-primary" style={{ width: "60px", height: "60px" }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-secondary fw-500 fs-6">Preparing payment...</p>
        </div>
      </FormContainer>
    );

  if (error)
    return (
      <FormContainer>
        <Alert variant="danger" className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "300px", gap: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h5 className="mb-2">Payment Error</h5>
          <p className="mb-3 text-center">{error}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </Alert>
      </FormContainer>
    );

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <div className="py-4 py-md-5">
        <div className="text-center mb-4 mb-md-5">
          <h1 className="fw-bold text-dark mb-2" style={{ fontSize: isMobile ? "1.6rem" : "2.2rem" }}>
            💳 Complete Your Payment
          </h1>
          <p className="text-secondary fs-6">Enter your card details securely below</p>
        </div>

        <Row className="g-4">
          <Col lg={6} md={12} sm={12}>
            <Card className="h-100 border-light shadow-sm" style={{ borderRadius: "12px" }}>
              <Card.Body>
                <Card.Title className="fw-bold text-dark mb-4" style={{ fontSize: "1.3rem" }}>Order Summary</Card.Title>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="d-flex justify-content-between border-bottom pb-2" style={{ fontSize: "0.95rem" }}>
                    <span className="text-secondary">Subtotal:</span>
                    <span className="fw-500">${itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2" style={{ fontSize: "0.95rem" }}>
                    <span className="text-secondary">Shipping:</span>
                    <span className="fw-500">${shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2" style={{ fontSize: "0.95rem" }}>
                    <span className="text-secondary">Tax (15%):</span>
                    <span className="fw-500">${taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top border-primary border-2" style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                    <span className="text-dark">Total Amount:</span>
                    <span style={{ color: "#27ae60", fontSize: "1.3rem" }}>${totalPrices.toFixed(2)}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} md={12} sm={12}>
            <Card className="border-light shadow-sm" style={{ borderRadius: "12px" }}>
              <Card.Body>
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    totalAmount={totalPrices}
                    onPaymentSuccess={(paymentIntent) => {
                      navigate("/placeorder", { state: { paymentIntent } });
                    }}
                  />
                </Elements>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </FormContainer>
  );
};

export default PaymentScreen;