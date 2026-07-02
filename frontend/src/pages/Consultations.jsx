// src/pages/Consultations.jsx
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";
import { CalendarIcon } from "../components/ui/icons";

export default function Consultations() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Consultations</h2>
        <p className="text-muted mb-0">
          Live video consultations are on the way.
        </p>
      </div>

      <div className="card p-0">
        <EmptyState
          icon={CalendarIcon}
          title="Coming soon"
          body="Video consultations aren't available just yet. In the meantime, you can book an in-person appointment with any of our verified doctors."
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
    </div>
  );
}
