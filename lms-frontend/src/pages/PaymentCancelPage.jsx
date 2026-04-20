import { Link } from "react-router-dom";

export default function PaymentCancelPage() {
  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Payment Cancelled</h1>
        <p>The checkout was cancelled before payment completion.</p>
      </div>

      <div className="card">
        <h2 className="section-title">No charge was completed</h2>
        <p className="muted">
          You can go back to the payments page and try again.
        </p>

        <div style={{ marginTop: "18px" }}>
          <Link className="primary-btn" to="/payments">
            Back to Payments
          </Link>
        </div>
      </div>
    </div>
  );
}