// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginUser(email, password);
      nav("/dashboard");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="col-md-5 mx-auto card p-4">
        <h2 className="text-center mb-4 fw-bold">Login</h2>

        {error && (
          <div className="alert alert-danger py-2 mb-3">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-end mt-1">
              <Link
                to="/forgot-password"
                state={{ accountType: "patient" }}
                className="small"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="btn w-100 text-white btn-teal"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/signup">Don’t have an account? Signup</Link>
        </div>
      </div>
    </div>
  );
}
