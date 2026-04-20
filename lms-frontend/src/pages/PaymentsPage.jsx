import { useEffect, useState } from "react";
import { mainAPI, extractError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PaymentsPage() {
  const { user } = useAuth();

  const [catalog, setCatalog] = useState([]);
  const [history, setHistory] = useState([]);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadCatalog = async () => {
    setLoadingCatalog(true);

    try {
      const res = await mainAPI.get("/payments/catalog");
      setCatalog(res.data.items || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoadingCatalog(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.id) return;

    setLoadingHistory(true);

    try {
      const res = await mainAPI.get(`/payments/my-transactions/${user.id}`);
      setHistory(res.data.transactions || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const handleCheckout = async (productKey) => {
    setError("");
    setMessage("");
    setCheckoutLoading(productKey);

    try {
      const res = await mainAPI.post("/payments/create-checkout-session", {
        user_id: 1,
        product_key: productKey,
      });

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        setMessage("Checkout created, but redirect missing.");
      }

    } catch (err) {
      setError(extractError(err));
    } finally {
      setCheckoutLoading("");
      setShowUpgradeModal(false);
    }
  };
  const hasPremium = history.some(
  txn =>
    txn.payment_type === "premium" &&
    txn.status === "paid"
);

  return (
    <div className="page-wrap">

      <div className="page-header">
        <h1>Payments</h1>
        <p>
          Buy courses or upgrade to premium securely with Stripe Checkout.
        </p>
      </div>

      {message && (
        <div className="alert success-alert">
          {message}
        </div>
      )}

      {error && (
        <div className="alert error-alert">
          {error}
        </div>
      )}

      {/* PRODUCTS */}
      <div className="card">

        <h2 className="section-title">
          Available Products
        </h2>

        {loadingCatalog ? (
          <div className="empty-state">
            Loading payment options...
          </div>
        ) : (
          <div className="pricing-grid">

            {catalog.map((item) => (

              <div
                key={item.product_key}
                className="pricing-card"
              >

                <div className="pricing-top">
                  <span className="payment-chip">
                    {item.payment_type === "course"
                      ? "Course"
                      : "Premium"}
                  </span>

                  <h3>{item.name}</h3>

                  <p className="muted">
                    {item.description}
                  </p>
                </div>

                <div className="pricing-price">
                  ₹ {Number(item.amount).toFixed(2)}
                </div>

                <div
                  className="muted"
                  style={{ marginBottom: "14px" }}
                >
                  {item.plan_name
                    ? `Plan: ${item.plan_name}`
                    : `Course ID: ${item.course_id ?? "-"}`}
                </div>

                {/* BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                  }}
                >

                  {/* Buy Now */}
                  <button
                    className="primary-btn"
                    onClick={() =>
                      handleCheckout(item.product_key)
                    }
                    disabled={checkoutLoading !== ""}
                  >
                    {checkoutLoading === item.product_key
                      ? "Redirecting..."
                      : "Buy Now"}
                  </button>

                  {/* Upgrade Plan for ALL items */}
                    <button
                        className="primary-btn"
                        style={{
                        background: hasPremium
                        ? "#374151"
                        : "#111827",

                        opacity: hasPremium ? 0.55 : 1,

                        cursor: hasPremium
                        ? "not-allowed"
                        : "pointer"
                        }}

                disabled={hasPremium}

                onClick={() => {
                if (!hasPremium) {
                setShowUpgradeModal(true);
                }
                }}
                    >
                {hasPremium
                ? "Premium Active"
                : "Upgrade Plan"}
                    </button>   

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
        >

          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "18px",
              width: "420px",
              textAlign: "center"
            }}
          >

            <h2>Upgrade to Premium</h2>

            <p style={{ marginBottom: "20px" }}>
              Choose your premium plan
            </p>

            <button
              className="primary-btn"
              style={{
                width: "100%",
                marginBottom: "12px"
              }}
              onClick={() =>
                handleCheckout("premium_monthly")
              }
            >
              Upgrade Monthly ₹999
            </button>

            <button
              className="primary-btn"
              style={{
                width: "100%",
                marginBottom: "12px"
              }}
              onClick={() =>
                handleCheckout("premium_yearly")
              }
            >
              Upgrade Yearly ₹9999
            </button>

            <button
              onClick={() =>
                setShowUpgradeModal(false)
              }
              style={{
                border: "none",
                background: "transparent",
                marginTop: "10px",
                cursor: "pointer"
              }}
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* TRANSACTIONS */}
      <div
        className="card"
        style={{ marginTop: "22px" }}
      >

        <h2 className="section-title">
          My Transactions
        </h2>

        {loadingHistory ? (
          <div className="empty-state">
            Loading transaction history...
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            No transactions yet.
          </div>
        ) : (
          <div className="table-shell">

            <table className="pretty-table">

              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Access</th>
                  <th>Session ID</th>
                  <th>Created At</th>
                </tr>
              </thead>

              <tbody>

                {history.map((txn) => (
                  <tr key={txn.id}>

                    <td>{txn.item_name}</td>

                    <td>{txn.payment_type}</td>

                    <td>
                      {txn.currency?.toUpperCase()}
                      {" "}
                      {Number(txn.amount).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={
                          txn.status === "paid"
                            ? "payment-status paid"
                            : txn.status === "pending"
                            ? "payment-status pending"
                            : txn.status === "failed"
                            ? "payment-status failed"
                            : txn.status === "cancelled"
                            ? "payment-status cancelled"
                            : "payment-status"
                        }
                      >
                        {txn.status}
                      </span>
                    </td>

                    <td>
                      {txn.access_granted
                        ? "Granted"
                        : "Not yet"}
                    </td>

                    <td>
                      {txn.stripe_checkout_session_id}
                    </td>

                    <td>
                      {new Date(
                        txn.created_at
                      ).toLocaleString()}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}