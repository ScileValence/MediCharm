import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  return (
    <div className="container mt-5">
      {/* Welcome Card */}
      <div className="card shadow-sm p-4 mb-5">
        <h3 className="fw-bold">Welcome, {user?.name || "User"} 👋</h3>
        <p className="text-muted">Here’s your quick overview</p>
      </div>

      {/* Quick Action Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <Link to="/appointments" className="text-decoration-none">
            <div className="card h-100 shadow-sm text-center border-0 hover-shadow">
              <div className="card-body">
                <h5 className="card-title fw-semibold">Appointments</h5>
                <p className="card-text text-muted">View or schedule appointments with doctors</p>
                <button className="btn btn-outline-primary">Go</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/reports" className="text-decoration-none">
            <div className="card h-100 shadow-sm text-center border-0 hover-shadow">
              <div className="card-body">
                <h5 className="card-title fw-semibold">Reports</h5>
                <p className="card-text text-muted">Access all your medical reports</p>
                <button className="btn btn-outline-success">Go</button>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/order-medicine" className="text-decoration-none">
            <div className="card h-100 shadow-sm text-center border-0 hover-shadow">
              <div className="card-body">
                <h5 className="card-title fw-semibold">Order Medicine</h5>
                <p className="card-text text-muted">Order medicines online with delivery</p>
                <button className="btn btn-outline-warning">Go</button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
