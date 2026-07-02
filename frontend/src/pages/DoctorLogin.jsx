import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function DoctorLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/doctor/login",
        {
          email,
          password,
        }
      );

      const { doctor, token } = res.data;

      localStorage.setItem(
        "doctor",
        JSON.stringify(doctor)
      );

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "doctorLoggedIn",
        "true"
      );

      navigate("/doctor-dashboard");

    } catch (err) {

      console.error(
        "Doctor login failed:",
        err
      );

      setError(
        err?.response?.data?.error ||
        "Doctor login failed"
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
        <h3 className="text-center mb-4 text-primary">
          👨‍⚕️ Doctor Login
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
              onChange={(e) =>
                setEmail(e.target.value)
              }
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
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <div className="text-end mt-1">
              <Link
                to="/forgot-password"
                state={{ accountType: "doctor" }}
                className="small"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}
