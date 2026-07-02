// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      console.warn("🔒 Redirecting (no valid user)");
      return <Navigate to="/login" replace />;
    }
    console.log("✅ PrivateRoute passed for user:", user);
    return children;
  } catch (err) {
    console.error("PrivateRoute error:", err);
    return <Navigate to="/login" replace />;
  }
}
