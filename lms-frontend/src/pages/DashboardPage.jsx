import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back. Your LMS workspace is connected and ready.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>User ID</h3>
          <p>{user?.id || "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Username</h3>
          <p>{user?.username || "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Email</h3>
          <p>{user?.email || "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Status</h3>
          <p>Live</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h2 className="section-title">Connected Modules</h2>
          <div className="feature-grid">
            <div className="feature-card">OTP authentication</div>
            <div className="feature-card">Social login endpoints</div>
            <div className="feature-card">Attendance management</div>
            <div className="feature-card">Assignments workflow</div>
            <div className="feature-card">Notification center</div>
            <div className="feature-card">Protected dashboard routes</div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Project Summary</h2>
          <p className="muted">
            Your frontend is now connected to separate auth and main FastAPI
            services. This panel gives a clean presentation for demo and
            submission screenshots.
          </p>
          <div className="feature-grid" style={{ marginTop: "16px" }}>
            <div className="feature-card">Auth API → 8001</div>
            <div className="feature-card">Main API → 8002</div>
            <div className="feature-card">Frontend → 3000</div>
          </div>
        </div>
      </div>
    </div>
  );
}