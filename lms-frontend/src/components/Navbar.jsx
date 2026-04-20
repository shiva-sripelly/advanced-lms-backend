import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
<<<<<<< HEAD
  <header className="navbar">
    <div className="navbar-brand">
      <div className="brand-badge">LMS</div>
      <div>
        <h2>Learning Management System</h2>
        <p>FastAPI + React admin frontend</p>
      </div>
    </div>

    <nav className="nav-links">
      <Link className={isActive("/") ? "active" : ""} to="/">Dashboard</Link>
      <Link className={isActive("/attendance") ? "active" : ""} to="/attendance">Attendance</Link>
      <Link className={isActive("/assignments") ? "active" : ""} to="/assignments">Assignments</Link>
      <Link className={isActive("/notifications") ? "active" : ""} to="/notifications">Notifications</Link>
    </nav>

    <div className="nav-user">
      <div>
        <strong>{user?.username || "User"}</strong>
        <p>{user?.email || "No email"}</p>
      </div>
      <button className="danger-btn" onClick={handleLogout}>Logout</button>
    </div>
  </header>
);
=======
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-badge">LMS</div>
        <div>
          <h2>Learning Management System</h2>
          <p>FastAPI + React admin frontend</p>
        </div>
      </div>

      <nav className="nav-links">
        <Link className={isActive("/") ? "active" : ""} to="/">Dashboard</Link>
        <Link className={isActive("/attendance") ? "active" : ""} to="/attendance">Attendance</Link>
        <Link className={isActive("/assignments") ? "active" : ""} to="/assignments">Assignments</Link>
        <Link className={isActive("/notifications") ? "active" : ""} to="/notifications">Notifications</Link>
        <Link className={isActive("/payments") ? "active" : ""} to="/payments">Payments</Link>
      </nav>

      <div className="nav-user">
        <div>
          <strong>{user?.username || "User"}</strong>
          <p>{user?.email || "No email"}</p>
        </div>
        <button className="danger-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
>>>>>>> 73c37ea (payment added)
}