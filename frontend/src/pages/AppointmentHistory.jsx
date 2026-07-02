// src/pages/AppointmentHistory.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointmentHistory, deleteAppointment } from "../utils/appointments";
import { formatDoctorName } from "../utils/formatDoctorName";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import StatusPill, { statusCardTone } from "../components/ui/StatusPill";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { SkeletonCardList } from "../components/ui/Skeleton";
import { CalendarIcon } from "../components/ui/icons";

const FILTERS = ["ALL", "UPCOMING", "COMPLETED", "CANCELLED"];

export default function AppointmentHistory() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(stored);
    setUserId(user.id);
    fetchHistory(user.id);
  }, [navigate]);

  const fetchHistory = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAppointmentHistory(id);

      const sorted = [...(data || [])].sort((a, b) => {
        const da = a.appointmentTime ? new Date(a.appointmentTime).getTime() : 0;
        const db = b.appointmentTime ? new Date(b.appointmentTime).getTime() : 0;
        return db - da;
      });

      setAppointments(sorted);
    } catch (err) {
      console.error("❌ Failed to fetch appointment history:", err);
      setError("Failed to load your appointment history.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      setCancellingId(id);

      const updated = await deleteAppointment(id);

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );

      showToast("Appointment cancelled");
    } catch (err) {
      showToast(
        err?.response?.data?.error || "Failed to cancel appointment",
        "error"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const visible = appointments.filter((a) => {
    const status = a.status;
    if (filter === "ALL") return true;
    if (filter === "UPCOMING") return status === "PENDING" || status === "CONFIRMED";
    if (filter === "COMPLETED") return status === "COMPLETED";
    if (filter === "CANCELLED") return status === "CANCELLED" || status === "REJECTED";
    return true;
  });

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Appointment History</h2>
          <p className="text-muted mb-0">Every visit, past and upcoming.</p>
        </div>

        <button
          className="btn btn-teal text-white"
          onClick={() => navigate("/appointments")}
        >
          + Book New Appointment
        </button>
      </div>

      {!loading && !error && appointments.length > 0 && (
        <div className="btn-group mb-4 flex-wrap" role="group">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              className={`btn btn-sm ${
                filter === key ? "btn-teal text-white" : "btn-outline-teal"
              }`}
              onClick={() => setFilter(key)}
            >
              {key === "ALL" ? "All" : key.charAt(0) + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonCardList count={4} />
      ) : error ? (
        <ErrorState body={error} onRetry={() => fetchHistory(userId)} />
      ) : appointments.length === 0 ? (
        <div className="card p-0">
          <EmptyState
            icon={CalendarIcon}
            title="No appointments yet"
            body="Book your first appointment and it will show up here."
            action={
              <button
                className="btn btn-teal text-white"
                onClick={() => navigate("/appointments")}
              >
                Book an Appointment
              </button>
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-0">
          <EmptyState
            icon={CalendarIcon}
            title="Nothing in this filter"
            body="Try a different filter to see your other appointments."
          />
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {visible.map((appt) => {
            const canCancel = appt.status === "PENDING" || appt.status === "CONFIRMED";
            const busy = cancellingId === appt.id;

            return (
              <div
                key={appt.id}
                className={`card status-card status-card--${statusCardTone(appt.status)} p-3`}
              >
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                  <div>
                    <div className="fw-semibold">
                      {appt.doctor?.name
                        ? formatDoctorName(appt.doctor.name)
                        : "No doctor assigned"}
                    </div>
                    {appt.dept && (
                      <span className="tag-chip d-inline-block my-1">{appt.dept}</span>
                    )}
                    <div className="text-muted small d-flex align-items-center gap-1">
                      <CalendarIcon style={{ width: "0.9rem", height: "0.9rem" }} />
                      {appt.appointmentTime
                        ? new Date(appt.appointmentTime).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}{" "}
                      ·{" "}
                      {appt.appointmentTime
                        ? new Date(appt.appointmentTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <StatusPill status={appt.status} />
                    {canCancel && (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={busy}
                        onClick={() => handleCancel(appt.id)}
                      >
                        {busy ? "Cancelling..." : "Cancel"}
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
  );
}
