// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, logoutUser } from "../utils/auth";
import { isAdminLoggedIn, getAdmin, logoutAdmin } from "../utils/admin";
import { formatDoctorName } from "../utils/formatDoctorName";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const nav = useNavigate();
  const logged = isLoggedIn();
  const doctor = JSON.parse(localStorage.getItem("doctor"));
  const adminLogged = isAdminLoggedIn();
  const admin = getAdmin();

  const handleLogout = () => {
    logoutUser(); // removes user session
    localStorage.removeItem("doctor"); // also remove doctor session
    logoutAdmin(); // also remove admin session
    nav("/");
    window.location.reload();
  };

  return (
    <header className="navbar navbar-expand-md navbar-light bg-white border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold text-teal mb-0">
          MediCharm
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {/* Patient Logged In */}
            {logged && !doctor && !adminLogged && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/appointments">
                    Appointments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/reports">
                    Reports
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/order-medicine">
                    Medicine
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <NotificationBell />
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Doctor Logged In */}
            {doctor && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/doctor-dashboard">
                    {formatDoctorName(doctor.name)}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/doctor-profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <NotificationBell />
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Admin Logged In */}
            {adminLogged && admin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin-dashboard">
                    🛠️ {admin.name || "Admin"}
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* No one logged in */}
            {!logged && !doctor && !adminLogged && (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-teal btn-sm me-2" to="/login">
                    Patient Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-teal btn-sm me-2" to="/doctor-login">
                    Doctor Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-teal text-white btn-sm" to="/signup">
                    Signup
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-secondary btn-sm" to="/admin-login">
                    Admin
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
