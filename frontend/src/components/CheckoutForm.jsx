import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useSelector } from "react-redux";

const CheckoutForm = ({ clientSecret, onPaymentSuccess }) => {
    const { userInfo } = useSelector((state) => state.userLogin);
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const card = elements.getElement(CardElement);
            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card },
            });
            if (paymentResult.error) {
                setError(paymentResult.error.message);
                setLoading(false);
            } else if (paymentResult.paymentIntent.status === "succeeded") {
                onPaymentSuccess(paymentResult.paymentIntent);
            }
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formSection}>
                <label style={styles.label}>Card Details</label>
                <div style={styles.cardInputWrapper}>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: "16px",
                                    color: "#424770",
                                    "::placeholder": {
                                        color: "#aab7c4",
                                    },
                                },
                                invalid: {
                                    color: "#fa755a",
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div style={styles.errorAlert}>
                    <span style={styles.errorIcon}>✕</span>
                    <span style={styles.errorText}>{error}</span>
                </div>
            )}

            <div style={styles.securityInfo}>
                <span style={styles.lockIcon}>🔒</span>
                <span style={styles.securityText}>Your payment details are secure and encrypted</span>
            </div>

            <button
                type="submit"
                disabled={loading || !stripe}
                style={{
                    ...styles.submitBtn,
                    ...(loading || !stripe ? styles.submitBtnDisabled : {}),
                }}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm" style={styles.btnSpinner}></span>
                        {" "}Processing...
                    </>
                ) : (
                    <>Pay Now 💳</>
                )}
            </button>
        </form>
    );
};

const styles = {
    form: {
        backgroundColor: "#fff",
        border: "1px solid #e9ecef",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    formSection: {
        marginBottom: "1.5rem",
    },
    label: {
        display: "block",
        marginBottom: "0.8rem",
        fontSize: "1rem",
        fontWeight: "600",
        color: "#2c3e50",
    },
    cardInputWrapper: {
        padding: "1.2rem",
        border: "1.5px solid #d9d9d9",
        borderRadius: "8px",
        backgroundColor: "#fafbfc",
        transition: "all 0.3s ease",
    },
    errorAlert: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        backgroundColor: "#fff5f5",
        border: "1px solid #fc8181",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
    },
    errorIcon: {
        fontSize: "1.2rem",
        color: "#c53030",
        fontWeight: "bold",
    },
    errorText: {
        color: "#742a2a",
        fontSize: "0.95rem",
    },
    securityInfo: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1rem",
        backgroundColor: "#f0f7ff",
        borderRadius: "8px",
        marginBottom: "1.5rem",
        fontSize: "0.85rem",
        color: "#1e40af",
    },
    lockIcon: {
        fontSize: "1rem",
    },
    securityText: {
        fontWeight: "500",
    },
    submitBtn: {
        width: "100%",
        padding: "0.75rem 1.5rem",
        backgroundColor: "#3498db",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        boxShadow: "0 2px 8px rgba(52, 152, 219, 0.3)",
    },
    submitBtnDisabled: {
        backgroundColor: "#bdc3c7",
        cursor: "not-allowed",
        boxShadow: "none",
    },
    btnSpinner: {
        marginRight: "0.5rem",
    },
};

export default CheckoutForm;

