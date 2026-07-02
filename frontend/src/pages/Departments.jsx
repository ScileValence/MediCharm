// src/pages/Departments.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { formatDoctorName } from "../utils/formatDoctorName";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { SkeletonCardList } from "../components/ui/Skeleton";

export default function Departments() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/doctors/all");

      // Only show doctors who are actually approved and currently
      // available — a pending or suspended doctor shouldn't be
      // bookable from this public-facing showcase.
      const approved = (res.data || []).filter(
        (d) => d.status === "APPROVED" && d.available !== false
      );

      setDoctors(approved);
    } catch (err) {
      console.error("❌ Failed to fetch doctors:", err);
      setError("Failed to load departments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Group the flat doctor list into { departmentName: [doctors] }
  // so the page reflects whatever departments actually exist in the
  // database right now, instead of a fixed hardcoded list.
  const departmentsData = doctors.reduce((acc, doc) => {
    const dept = doc.dept || "General";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(doc);
    return acc;
  }, {});

  const departmentNames = Object.keys(departmentsData).sort();

  const handleBookAppointment = (doc) => {
    // Carry the department + doctor name forward so Appointments.jsx
    // can pre-select them, instead of dropping the patient on an
    // empty booking form with no idea which doctor they came from.
    navigate("/appointments", {
      state: {
        department: doc.dept,
        doctorName: doc.name,
      },
    });
  };

  return (
    <div className="container py-4">
      <div className="mb-4 text-center">
        <h2 className="fw-bold mb-1">Departments</h2>
        <p className="text-muted mb-0">
          Find a verified specialist by department.
        </p>
      </div>

      {loading ? (
        <SkeletonCardList count={4} />
      ) : error ? (
        <ErrorState body={error} onRetry={fetchDoctors} />
      ) : departmentNames.length === 0 ? (
        <div className="card p-0">
          <EmptyState
            title="No departments available yet"
            body="Please check back soon — doctors are being onboarded."
          />
        </div>
      ) : !selectedDept ? (
        <div className="row g-3">
          {departmentNames.map((dept) => (
            <div key={dept} className="col-12 col-md-6 col-lg-4">
              <div
                className="card hover-shadow text-center p-4 h-100"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedDept(dept)}
              >
                <div className="fs-1 mb-2" aria-hidden="true">🏥</div>
                <h5 className="fw-semibold mb-1">{dept}</h5>
                <p className="text-muted mb-0">
                  {departmentsData[dept].length} doctor
                  {departmentsData[dept].length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => setSelectedDept(null)}
          >
            ← Back to Departments
          </button>

          <h4 className="fw-bold mb-3 text-center">
            {selectedDept} Department
          </h4>

          <div className="row g-3">
            {departmentsData[selectedDept].map((doc) => (
              <div key={doc.id} className="col-12 col-md-6 col-lg-4">
                <div className="card p-4 h-100 d-flex flex-column">
                  <div className="text-center mb-2">
                    <div
                      className="d-inline-flex align-items-center justify-content-center mb-2"
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "50%",
                        background: "var(--brand-50)",
                        fontSize: "1.5rem",
                      }}
                      aria-hidden="true"
                    >
                      👨‍⚕️
                    </div>
                    <h5 className="fw-semibold mb-1">
                      {formatDoctorName(doc.name)}
                    </h5>
                    <span className="tag-chip d-inline-block">
                      {doc.specialization || doc.dept}
                    </span>
                  </div>

                  {doc.qualification && (
                    <p className="text-muted text-center small mb-2">
                      {doc.qualification}
                    </p>
                  )}

                  <div className="text-center text-muted small mb-3">
                    {doc.experienceYears != null && (
                      <div>{doc.experienceYears} years experience</div>
                    )}
                    {doc.hospital && <div>{doc.hospital}</div>}
                    {doc.consultationFee != null && (
                      <div>Consultation: ₹{doc.consultationFee}</div>
                    )}
                  </div>

                  <button
                    className="btn btn-teal text-white w-100 mt-auto"
                    onClick={() => handleBookAppointment(doc)}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
