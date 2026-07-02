// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { getAdmin, isAdminLoggedIn } from "../utils/admin";

export default function AdminRoute({ children }) {
  const logged = isAdminLoggedIn();
  const admin = getAdmin();

  if (!logged || !admin || admin.role !== "ADMIN") {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
