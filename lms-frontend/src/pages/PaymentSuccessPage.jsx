import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { mainAPI, extractError } from "../api/client";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setError("Missing session_id in success URL.");
        setLoading(false);
        return;
      }

      try {
        const res = await mainAPI.get(`/payments/session/${sessionId}`);
        setDetails(res.data);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Payment Success</h1>
        <p>Your Stripe Checkout payment has been completed.</p>
      </div>

      {loading && <div className="card">Loading payment details...</div>}
      {error && <div className="alert error-alert">{error}</div>}

      {details && (
        <div className="card">
          <h2 className="section-title">Payment Summary</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Session</h3>
              <p>{details.session_id}</p>
            </div>
            <div className="stat-card">
              <h3>Status</h3>
              <p>{details.payment_status || details.status || "-"}</p>
            </div>
            <div className="stat-card">
              <h3>Amount</h3>
              <p>
                {details.currency?.toUpperCase()} {Number(details.amount_total || 0).toFixed(2)}
              </p>
            </div>
            <div className="stat-card">
              <h3>Email</h3>
              <p>{details.customer_email || "-"}</p>
            </div>
          </div>

          {details.local_transaction && (
            <div className="table-shell" style={{ marginTop: "20px" }}>
              <table className="pretty-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Access</th>
                    <th>Local Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{details.local_transaction.item_name}</td>
                    <td>{details.local_transaction.payment_type}</td>
                    <td>{details.local_transaction.access_granted ? "Granted" : "Pending webhook"}</td>
                    <td>{details.local_transaction.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: "18px" }}>
            <Link className="primary-btn" to="/payments">
              Back to Payments
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}