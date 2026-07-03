import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import StatusPill, { statusCardTone } from "../components/ui/StatusPill";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonCardList } from "../components/ui/Skeleton";
import { formatDoctorName } from "../utils/formatDoctorName";
import { CalendarIcon } from "../components/ui/icons";

export default function Appointments() {
  const location = useLocation();
  const navigate = useNavigate();
  const preselect = location.state || {};
  const { toast, showToast, clearToast } = useToast();

  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    department: preselect.department || "",
    doctor: preselect.doctorName || "",
    date: "",
    time: "",
    description: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load user
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // Fetch appointments
  const fetchAppointments = async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/appointments/user/${userId}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("❌ Error loading appointments:", err);
      setError("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(user?.id);
  }, [user]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/doctors/all");

        if (res.data) {
          const uniqueDepts = [...new Set(res.data.map((d) => d.dept))];
          setDepartments(uniqueDepts);
        }
      } catch (err) {
        console.error("❌ Failed to fetch departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch doctors by department
  const fetchDoctorsByDept = async (dept) => {
    try {
      const res = await api.get(`/doctors/by-department/${dept}`);
      setDoctors(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch doctors:", err);
      setDoctors([]);
    }
  };

  // If we arrived here with a department already chosen (e.g. from
  // the Departments page's "Book Appointment" button), load that
  // department's doctors right away so the doctor dropdown is
  // populated and the pre-selected doctor name actually has a
  // matching <option> to land on.
  useEffect(() => {
    if (preselect.department) {
      fetchDoctorsByDept(preselect.department);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeptChange = (e) => {
    const dept = e.target.value;

    setForm({ ...form, department: dept, doctor: "" });

    if (dept) {
      fetchDoctorsByDept(dept);
    }
  };

  // Schedule appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      showToast("Please login first.", "error");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/appointments/schedule", {
        userId: user.id,
        department: form.department,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        description: form.description,
      });

      showToast("Appointment scheduled successfully!");

      setForm({
        department: "",
        doctor: "",
        date: "",
        time: "",
        description: "",
      });

      fetchAppointments(user.id);
    } catch (err) {
      console.error("❌ Scheduling error:", err);
      showToast("Failed to schedule appointment.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Schedule an Appointment</h2>
          <p className="text-muted mb-0">
            Pick a department and doctor, then choose a time that works.
          </p>
        </div>

        <button
          className="btn btn-outline-teal"
          onClick={() => navigate("/appointment-history")}
        >
          View History
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card p-4">
            <h5 className="fw-semibold mb-3">New Appointment</h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Department</label>

                <select
                  className="form-select"
                  value={form.department}
                  onChange={handleDeptChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Doctor</label>

                <select
                  className="form-select"
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  required
                  disabled={!form.department}
                >
                  <option value="">
                    {form.department ? "Select Doctor" : "Choose department first"}
                  </option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {formatDoctorName(doc.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col">
                  <label className="form-label fw-semibold">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div className="col">
                  <label className="form-label fw-semibold">Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Reason for visit <span className="text-muted fw-normal">(optional)</span>
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Briefly describe your symptoms or reason for the visit"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-teal text-white w-100"
                disabled={submitting}
              >
                {submitting ? "Scheduling..." : "Schedule Appointment"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <h5 className="fw-semibold mb-3">Upcoming Appointments</h5>

          {loading ? (
            <SkeletonCardList count={3} />
          ) : appointments.length === 0 ? (
            <div className="card p-0">
              <EmptyState
                icon={CalendarIcon}
                title="No scheduled appointments"
                body="Once you book an appointment, it'll appear here."
              />
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className={`card status-card status-card--${statusCardTone(a.status)} p-3`}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold">
                        {a.doctor?.name ? formatDoctorName(a.doctor.name) : "Unknown"}
                      </div>
                      {a.dept && (
                        <span className="tag-chip d-inline-block my-1">{a.dept}</span>
                      )}
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <CalendarIcon style={{ width: "0.9rem", height: "0.9rem" }} />
                        {a.appointmentTime?.split("T")[0]} ·{" "}
                        {a.appointmentTime?.split("T")[1]?.substring(0, 5)}
                      </div>
                      {a.notes && (
                        <div className="text-muted small fst-italic mt-1">{a.notes}</div>
                      )}
                    </div>

                    <StatusPill status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
