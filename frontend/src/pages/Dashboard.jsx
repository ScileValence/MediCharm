// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments, deleteAppointment } from "../utils/appointments";
import { getOrders, deleteOrder } from "../utils/orders";
import { formatDoctorName } from "../utils/formatDoctorName";
import StatusPill, { statusCardTone } from "../components/ui/StatusPill";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonCardList } from "../components/ui/Skeleton";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import {
  CalendarIcon,
  PillIcon,
} from "../components/ui/icons";

// Quick-action tiles. Kept data-driven (one array, one map) rather
// than four hand-copied card blocks, so the anatomy — icon, label,
// one line of supporting copy, one primary action — stays identical
// across all four by construction, not by careful copy-pasting.
const QUICK_ACTIONS = [
  {
    key: "departments",
    icon: "🏥",
    title: "Departments",
    body: "Browse specialists by department",
    cta: "View Doctors",
    to: "/departments",
  },
  {
    key: "appointments",
    icon: "📅",
    title: "Appointments",
    body: "Book or manage your visits",
    cta: "New Appointment",
    to: "/appointments",
  },
  {
    key: "medicine",
    icon: "💊",
    title: "Order Medicine",
    body: "Get medicines delivered to your door",
    cta: "Order Now",
    to: "/order-medicine",
  },
  {
    key: "reports",
    icon: "📄",
    title: "Reports",
    body: "Access your test results",
    cta: "View Reports",
    to: "/reports",
  },
];

export default function Dashboard() {
  const nav = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) setUser(JSON.parse(rawUser));

    fetchAppointments();
    fetchOrders();
  }, []);

  const fetchAppointments = async () => {
    try {
      const rawUser = JSON.parse(localStorage.getItem("user"));
      if (!rawUser?.id) return;

      const data = await getAppointments(rawUser.id);

      // "Upcoming Appointments" should only ever show appointments
      // that are still pending action — completed ones belong in
      // history, not here with a stale Cancel button next to them.
      const upcoming = data
        .filter(
          (appt) =>
            appt.status === "PENDING" || appt.status === "CONFIRMED"
        )
        .sort(
          (a, b) =>
            new Date(a.appointmentTime) - new Date(b.appointmentTime)
        );

      setAppointments(upcoming);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const rawUser = JSON.parse(localStorage.getItem("user"));
      if (!rawUser?.id) return;

      const data = await getOrders(rawUser.id);

      const activeOrders = data
        .filter((order) => order.status?.toUpperCase() !== "CANCELLED")
        .sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

      setOrders(activeOrders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await deleteAppointment(id);
      showToast("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment", err);
      showToast("Failed to cancel appointment", "error");
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await deleteOrder(id);
      showToast("Order cancelled");
      fetchOrders();
    } catch (err) {
      console.error("Failed to cancel order", err);
      showToast("Failed to cancel order", "error");
    }
  };

  const nextAppointment = appointments[0];
  const otherAppointments = appointments.slice(1);

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      {/* ---------- Header ---------- */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          {user?.name ? `Welcome back, ${user.name}` : "Welcome back"}
        </h2>
        <p className="text-muted mb-0">Here's your care overview.</p>
      </div>

      {/* ---------- Next appointment hero widget ---------- */}
      <div className="mb-4">
        {loadingAppointments ? (
          <SkeletonCardList count={1} />
        ) : nextAppointment ? (
          <div
            className={`card status-card status-card--${statusCardTone(
              nextAppointment.status
            )} p-4`}
          >
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
              <span className="text-muted small fw-semibold text-uppercase">
                Next appointment
              </span>
              <StatusPill status={nextAppointment.status} />
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h4 className="mb-1">
                  {nextAppointment.doctor?.name
                    ? formatDoctorName(nextAppointment.doctor.name)
                    : "No doctor assigned"}
                </h4>
                {nextAppointment.dept && (
                  <span className="tag-chip mb-2 d-inline-block">
                    {nextAppointment.dept}
                  </span>
                )}
                <div className="text-muted d-flex align-items-center gap-2 mt-1">
                  <CalendarIcon style={{ width: "1rem", height: "1rem" }} />
                  {new Date(nextAppointment.appointmentTime).toLocaleString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => nav("/appointment-history")}
                >
                  View History
                </button>
                <button
                  className="btn btn-outline-teal"
                  onClick={() => handleCancelAppointment(nextAppointment.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-0">
            <EmptyState
              icon={CalendarIcon}
              title="No upcoming appointments"
              body="When you book a visit, your next appointment will show up here."
              action={
                <button
                  className="btn btn-teal text-white"
                  onClick={() => nav("/appointments")}
                >
                  Book an Appointment
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* ---------- Quick actions ---------- */}
      <div className="row g-3 mb-4">
        {QUICK_ACTIONS.map((action) => (
          <div className="col-12 col-md-6 col-lg-3" key={action.key}>
            <div className="card hover-shadow p-4 h-100 text-center">
              <div className="fs-1 mb-2" aria-hidden="true">
                {action.icon}
              </div>
              <h6 className="fw-semibold mb-1">{action.title}</h6>
              <p className="text-muted small mb-3">{action.body}</p>
              <button
                className="btn btn-outline-teal w-100 mt-auto"
                onClick={() => nav(action.to)}
              >
                {action.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* ---------- Remaining upcoming appointments ---------- */}
        <div className="col-12 col-lg-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-semibold mb-0">Also Scheduled</h5>
            {appointments.length > 0 && (
              <button
                className="btn btn-link btn-sm text-decoration-none p-0"
                onClick={() => nav("/appointment-history")}
              >
                View all
              </button>
            )}
          </div>

          {loadingAppointments ? (
            <SkeletonCardList count={2} />
          ) : otherAppointments.length === 0 ? (
            <div className="card p-0">
              <EmptyState
                icon={CalendarIcon}
                title={
                  appointments.length === 0
                    ? "Nothing scheduled"
                    : "No other appointments"
                }
                body={
                  appointments.length === 0
                    ? "You don't have any appointments booked right now."
                    : "Your next visit is shown above — that's the only one pending right now."
                }
              />
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {otherAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className={`card status-card status-card--${statusCardTone(
                    appt.status
                  )} p-3`}
                >
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <div>
                      <div className="fw-semibold">
                        {appt.doctor?.name
                          ? formatDoctorName(appt.doctor.name)
                          : "No doctor assigned"}
                      </div>
                      <div className="text-muted small">
                        {new Date(appt.appointmentTime).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        ·{" "}
                        {new Date(appt.appointmentTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <StatusPill status={appt.status} />
                  </div>
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleCancelAppointment(appt.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------- Recent orders ---------- */}
        <div className="col-12 col-lg-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-semibold mb-0">Recent Medicine Orders</h5>
            {orders.length > 0 && (
              <button
                className="btn btn-link btn-sm text-decoration-none p-0"
                onClick={() => nav("/order-history")}
              >
                View all
              </button>
            )}
          </div>

          {loadingOrders ? (
            <SkeletonCardList count={2} />
          ) : orders.length === 0 ? (
            <div className="card p-0">
              <EmptyState
                icon={PillIcon}
                title="No orders yet"
                body="Medicines you order will show up here for easy tracking."
                action={
                  <button
                    className="btn btn-teal text-white"
                    onClick={() => nav("/order-medicine")}
                  >
                    Order Medicine
                  </button>
                }
              />
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {orders.slice(0, 3).map((order) => {
                const medicineNames = order.items?.length
                  ? order.items.map((it) => it.medicine?.name).join(", ")
                  : order.medicineName || order.medicine?.name || "Medicine";

                return (
                  <div
                    key={order.id}
                    className={`card status-card status-card--${statusCardTone(
                      order.status
                    )} p-3`}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div>
                        <div className="fw-semibold">{medicineNames}</div>
                        <div className="text-muted small">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <StatusPill status={order.status} />
                        {order.status === "PLACED" && (
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
