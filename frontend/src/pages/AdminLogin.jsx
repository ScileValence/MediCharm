// src/pages/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../utils/admin";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await loginAdmin(email, password);

      navigate("/admin-dashboard");

    } catch (err) {
      console.error("Admin login failed:", err);

      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Admin login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div
        className="card p-4 mx-auto"
        style={{ maxWidth: "450px" }}
      >
        <h3 className="text-center mb-4">
          🛠️ Admin Login
        </h3>

        {error && (
          <div className="alert alert-danger py-2 mb-3">{error}</div>
        )}

        <form onSubmit={handleLogin}>

          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100 text-white"
            style={{ backgroundColor: "var(--gray-700)", borderColor: "var(--gray-700)" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}
