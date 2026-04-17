import { useState } from "react";
import { extractError, mainAPI } from "../api/client";

export default function NotificationsPage() {
  const [userId, setUserId] = useState("");
  const [notificationId, setNotificationId] = useState("");
  const [notifications, setNotifications] = useState(null);
  const [markResult, setMarkResult] = useState(null);
  const [error, setError] = useState("");

  const fetchNotifications = async (e) => {
    e.preventDefault();
    setError("");
    setNotifications(null);
    setMarkResult(null);

    try {
      const res = await mainAPI.get(`/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      setError(extractError(err));
    }
  };

  const markRead = async (e) => {
    e.preventDefault();
    setError("");
    setMarkResult(null);

    try {
      const res = await mainAPI.post("/notifications/mark-read", {
        notification_id: Number(notificationId)
      });
      setMarkResult(res.data);
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>View user notifications and update their status.</p>
      </div>

      <div className="two-col">
        <div className="card">
          <h2>Get Notifications</h2>
          <form onSubmit={fetchNotifications} className="form-grid">
            <input
              type="number"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <button className="primary-btn">Fetch Notifications</button>
          </form>
        </div>

        <div className="card">
          <h2>Mark Notification Read</h2>
          <form onSubmit={markRead} className="form-grid">
            <input
              type="number"
              placeholder="Notification ID"
              value={notificationId}
              onChange={(e) => setNotificationId(e.target.value)}
              required
            />
            <button className="success-btn">Mark as Read</button>
          </form>
        </div>
      </div>

      {error && <div className="alert error-alert">{error}</div>}

      {markResult && (
        <div className="card">
          <h2>Update Result</h2>
          <pre className="json-box">{JSON.stringify(markResult, null, 2)}</pre>
        </div>
      )}

      {notifications && (
        <div className="card">
          <h2>
            {notifications.user_name} — {notifications.total_notifications} Notifications
          </h2>

          {notifications.notifications.length === 0 ? (
            <div className="empty-state">No notifications found for this user.</div>
          ) : (
            <div className="table-shell">
              <table className="pretty-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Link</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.notifications.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <span className={item.is_read ? "tag read" : "tag unread"}>
                          {item.is_read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td>{item.message}</td>
                      <td>{item.link || "N/A"}</td>
                      <td>{item.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}