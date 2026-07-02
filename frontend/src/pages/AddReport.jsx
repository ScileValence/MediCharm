// src/pages/AddReport.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import ErrorState from "../components/ui/ErrorState";
import { formatDoctorName } from "../utils/formatDoctorName";

export default function AddReport() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [appointment, setAppointment] = useState(null);
  const [reportText, setReportText] = useState("");
  const [comments, setComments] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/appointments/${appointmentId}`);

      setAppointment(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch appointment:", err);
      setError("Failed to load appointment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!appointment) {
      showToast("Appointment not found.", "error");
      return;
    }

    const formData = new FormData();

    formData.append("appointmentId", appointmentId);
    formData.append("userId", appointment.user?.id || "");
    formData.append("doctorId", appointment.doctor?.id || "");
    formData.append("text", reportText);
    formData.append("comments", comments);

    if (file) {
      formData.append("file", file);
    }

    try {
      setSubmitting(true);

      await api.post("/reports/upload", formData);

      showToast("Report submitted successfully");

      setReportText("");
      setComments("");
      setFile(null);

      setTimeout(() => {
        navigate("/doctor-dashboard");
      }, 1200);
    } catch (err) {
      console.error("❌ Error uploading report:", err);
      showToast("Failed to upload report. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: "750px" }}>
        <div className="card p-4">
          <div className="skeleton mb-3" style={{ height: "1.5rem", width: "60%" }} />
          <div className="skeleton mb-2" style={{ height: "1rem", width: "40%" }} />
          <div className="skeleton mb-2" style={{ height: "1rem", width: "50%" }} />
          <div className="skeleton" style={{ height: "8rem", width: "100%" }} />
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container py-4" style={{ maxWidth: "750px" }}>
        <ErrorState
          body={error || "This appointment could not be found."}
          onRetry={fetchAppointment}
        />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      <div className="card p-4 mx-auto" style={{ maxWidth: "750px" }}>
        <h2 className="fw-bold mb-1">Add Medical Report</h2>
        <p className="text-muted mb-4">
          Document your findings for this appointment.
        </p>

        <div className="mb-4 pb-3 border-bottom" style={{ borderColor: "var(--gray-200)" }}>
          <h6 className="fw-semibold mb-2">Appointment Details</h6>

          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted">Patient: </span>
              {appointment.user?.name || "—"}
            </div>
            <div className="col-6">
              <span className="text-muted">Doctor: </span>
              {appointment.doctor?.name
                ? formatDoctorName(appointment.doctor.name)
                : "—"}
            </div>
            <div className="col-6">
              <span className="text-muted">Department: </span>
              {appointment.dept && (
                <span className="tag-chip">{appointment.dept}</span>
              )}
            </div>
            <div className="col-6">
              <span className="text-muted">Appointment Time: </span>
              {appointment.appointmentTime
                ? new Date(appointment.appointmentTime).toLocaleString()
                : "—"}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Doctor's Observation / Report
            </label>

            <textarea
              className="form-control"
              rows="4"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Doctor's Comments</label>

            <textarea
              className="form-control"
              rows="3"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional follow-up notes or suggestions"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Attach Report File</label>

            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-teal text-white w-100"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
