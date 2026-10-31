
import { useEffect, useState } from "react";
import "./Notifications.css";

const API = "http://localhost:3000/notifications";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get the logged-in student's email
  const email = localStorage.getItem("email");

  const fetchNotifications = async () => {
    if (!email) {
      setError("Please log in again. Email not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load notifications");
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PUT"
      });

      if (!response.ok) {
        throw new Error("Unable to update notification");
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id ? { ...item, read: true } : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your latest activities</p>
        </div>

        <span className="notifications-count">
          {unreadCount} unread
        </span>
      </div>

      <div className="notifications-toolbar">
        <span>All Notifications</span>

        <button
          className="notification-refresh-btn"
          onClick={fetchNotifications}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div className="notification-loading">
          Loading notifications...
        </div>
      )}

      {error && (
        <div className="notification-error">
          {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="notification-empty">
          <div className="notification-empty-icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>
            You're all caught up! New updates will appear here.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              className={`notification-card ${
                notification.read ? "read" : "unread"
              }`}
              key={notification._id}
            >
              <div className="notification-icon">🔔</div>

              <div className="notification-content">
                <p>{notification.message}</p>

                <small>
                  {notification.createdAt
                    ? new Date(notification.createdAt).toLocaleString()
                    : "Recently"}
                </small>
              </div>

              <div className="notification-actions">
                {!notification.read ? (
                  <button
                    className="notification-read-btn"
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark as read
                  </button>
                ) : (
                  <span className="notification-status">
                    Read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
