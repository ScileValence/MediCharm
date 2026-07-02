// src/pages/DoctorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { formatDoctorName } from "../utils/formatDoctorName";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import StatusPill from "../components/ui/StatusPill";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { SkeletonTableRows } from "../components/ui/Skeleton";
import { CalendarIcon } from "../components/ui/icons";

const ACTION_SUCCESS_MESSAGES = {
  confirm: "Appointment confirmed",
  complete: "Appointment marked as completed",
  reject: "Appointment rejected",
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("doctor");

    if (stored) {
      const parsed = JSON.parse(stored);
      setDoctor(parsed);
      fetchAppointments(parsed.id);
    } else {
      navigate("/doctor-login");
    }
  }, [navigate]);

  const fetchAppointments = async (doctorId) => {
    try {
      setError(null);

      const res = await api.get(`/appointments/doctor/${doctorId}`);

      setAppointments(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load doctor appointments:", err);
      setError("Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  // Update a single appointment in place rather than re-fetching the
  // whole list, so the table doesn't jump/flicker after an action.
  const applyUpdatedAppointment = (updated) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  };

  const handleAction = async (appointmentId, action, confirmMessage) => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    try {
      setActingId(appointmentId);

      const res = await api.put(`/appointments/${appointmentId}/${action}`);

      applyUpdatedAppointment(res.data);

      showToast(ACTION_SUCCESS_MESSAGES[action] || "Appointment updated");
    } catch (err) {
      console.error(`❌ Failed to ${action} appointment:`, err);

      showToast(
        err?.response?.data?.error || `Failed to ${action} appointment`,
        "error"
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          {doctor ? formatDoctorName(doctor.name) : "Doctor"}'s Dashboard
        </h2>
        <p className="text-muted mb-0">Manage your scheduled appointments.</p>
      </div>

      <div className="card p-4">
        <h5 className="fw-semibold mb-3">Upcoming Appointments</h5>

        {error ? (
          <ErrorState body={error} onRetry={() => fetchAppointments(doctor?.id)} />
        ) : appointments.length === 0 && !loading ? (
          <EmptyState
            icon={CalendarIcon}
            title="No scheduled appointments"
            body="Appointments patients book with you will appear here."
          />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <SkeletonTableRows columns={8} rows={4} />
                ) : (
                  appointments.map((appt, index) => {
                    const isPending = appt.status === "PENDING";
                    const isConfirmed = appt.status === "CONFIRMED";
                    const busy = actingId === appt.id;

                    return (
                      <tr key={appt.id}>
                        <td>{index + 1}</td>
                        <td>{appt.user?.name || "Unknown"}</td>
                        <td>
                          {appt.dept && (
                            <span className="tag-chip">{appt.dept}</span>
                          )}
                        </td>

                        <td>
                          {new Date(appt.appointmentTime).toLocaleDateString()}
                        </td>

                        <td>
                          {new Date(appt.appointmentTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="text-muted">{appt.notes || "—"}</td>

                        <td>
                          <StatusPill status={appt.status} />
                        </td>

                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            {isPending && (
                              <>
                                <button
                                  className="btn btn-sm btn-teal text-white"
                                  disabled={busy}
                                  onClick={() => handleAction(appt.id, "confirm")}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  disabled={busy}
                                  onClick={() =>
                                    handleAction(
                                      appt.id,
                                      "reject",
                                      "Reject this appointment request?"
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {isConfirmed && (
                              <button
                                className="btn btn-sm btn-outline-teal"
                                disabled={busy}
                                onClick={() =>
                                  handleAction(
                                    appt.id,
                                    "complete",
                                    "Mark this appointment as completed?"
                                  )
                                }
                              >
                                Mark Completed
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => navigate(`/doctor/report/${appt.id}`)}
                            >
                              Add Report
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
