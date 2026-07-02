// src/components/Sidebar.jsx
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="offcanvas-lg offcanvas-start" tabIndex="-1" id="offcanvasSidebar">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Menu</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div className="offcanvas-body p-0">
        <nav className="nav flex-column">
          <Link className="nav-link px-3 py-2" to="/dashboard">Dashboard</Link>
          <Link className="nav-link px-3 py-2" to="/appointments">Appointments</Link>
          <Link className="nav-link px-3 py-2" to="/reports">Reports</Link>
          <Link className="nav-link px-3 py-2" to="/medicines">Order Medicine</Link>
        </nav>
      </div>
    </div>
  );
}
