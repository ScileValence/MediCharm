// src/components/NotificationBell.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../utils/notifications";
import EmptyState from "./ui/EmptyState";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  InfoIcon,
} from "./ui/icons";

// Maps a notification's `type` (set server-side in NotificationHelper)
// to an icon + tint, reusing the same status-color vocabulary as
// StatusPill rather than inventing a new one.
const TYPE_STYLE = {
  APPOINTMENT_REQUESTED: { Icon: ClockIcon, tone: "pending" },
  APPOINTMENT_CONFIRMED: { Icon: CheckCircleIcon, tone: "confirmed" },
  APPOINTMENT_REJECTED: { Icon: XCircleIcon, tone: "cancelled" },
  APPOINTMENT_COMPLETED: { Icon: CheckCircleIcon, tone: "info" },
  APPOINTMENT_CANCELLED: { Icon: XCircleIcon, tone: "cancelled" },
  ORDER_PLACED: { Icon: InfoIcon, tone: "info" },
  ORDER_CANCELLED: { Icon: XCircleIcon, tone: "cancelled" },
  DOCTOR_APPROVED: { Icon: CheckCircleIcon, tone: "confirmed" },
  DOCTOR_REJECTED: { Icon: XCircleIcon, tone: "cancelled" },
  DOCTOR_SUSPENDED: { Icon: XCircleIcon, tone: "cancelled" },
  REPORT_ADDED: { Icon: InfoIcon, tone: "info" },
};

const TONE_COLOR = {
  pending: "var(--status-pending)",
  confirmed: "var(--status-confirmed)",
  cancelled: "var(--status-cancelled)",
  info: "var(--status-info)",
};

const TONE_BG = {
  pending: "var(--status-pending-tint)",
  confirmed: "var(--status-confirmed-tint)",
  cancelled: "var(--status-cancelled-tint)",
  info: "var(--status-info-tint)",
};

function timeAgo(dateString) {
  if (!dateString) return "";

  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString();
}

// Polling interval for the unread count — short enough to feel
// responsive without hammering the backend with a websocket-grade
// refresh rate this app doesn't need.
const POLL_MS = 30000;

export default function NotificationBell() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Silent — a failed background poll shouldn't surface as an
      // error to the person; the bell just won't update this cycle.
      console.error("Failed to refresh unread notification count:", err);
    }
  };

  useEffect(() => {
    refreshUnreadCount();

    const interval = setInterval(refreshUnreadCount, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);

    if (next && !loadedOnce) {
      setLoading(true);
      try {
        const data = await getMyNotifications();
        setNotifications(data || []);
        setLoadedOnce(true);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleItemClick = async (n) => {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    setOpen(false);

    if (n.link) {
      navigate(n.link);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();

    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  return (
    <div className="position-relative" ref={containerRef}>
      <button
        className="btn btn-outline-secondary btn-sm position-relative"
        onClick={toggleOpen}
        aria-label="Notifications"
        aria-expanded={open}
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{
              background: "var(--status-cancelled)",
              fontSize: "0.65rem",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card position-absolute end-0 mt-2"
          style={{
            width: "340px",
            maxHeight: "420px",
            overflowY: "auto",
            zIndex: 1050,
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: "var(--gray-200)" }}>
            <h6 className="fw-semibold mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm text-decoration-none p-0"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="p-2">
            {loading ? (
              <div className="d-flex flex-column gap-2 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: "3rem", width: "100%" }} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                title="No notifications yet"
                body="You'll see updates about appointments, orders, and reports here."
              />
            ) : (
              notifications.map((n) => {
                const style = TYPE_STYLE[n.type] || { Icon: InfoIcon, tone: "info" };
                const { Icon, tone } = style;

                return (
                  <button
                    key={n.id}
                    className="btn d-flex gap-2 align-items-start w-100 text-start p-2 border-0"
                    style={{
                      background: n.read ? "transparent" : "var(--gray-50)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    onClick={() => handleItemClick(n)}
                  >
                    <span
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        background: TONE_BG[tone],
                        color: TONE_COLOR[tone],
                      }}
                      aria-hidden="true"
                    >
                      <Icon style={{ width: "1rem", height: "1rem" }} />
                    </span>
                    <span className="flex-grow-1">
                      <span className="d-block fw-semibold small" style={{ color: "var(--gray-900)" }}>
                        {n.title}
                        {!n.read && (
                          <span
                            className="d-inline-block rounded-circle ms-2"
                            style={{
                              width: "0.4rem",
                              height: "0.4rem",
                              background: "var(--brand-500)",
                            }}
                            aria-label="Unread"
                          />
                        )}
                      </span>
                      <span className="d-block text-muted small">{n.message}</span>
                      <span className="d-block text-muted" style={{ fontSize: "0.72rem" }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
