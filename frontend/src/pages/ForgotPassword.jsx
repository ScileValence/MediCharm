// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { forgotPassword } from "../utils/auth";

export default function ForgotPassword() {
  const location = useLocation();

  // Arriving from /login vs /doctor-login pre-selects the right
  // account type, but it's still changeable — someone might land
  // here from a bookmark or a shared link with no state at all.
  const initialType =
    location.state?.accountType === "doctor" ? "doctor" : "patient";

  const [accountType, setAccountType] = useState(initialType);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim(), accountType);
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password request failed:", err);
      // Still show the generic success-style message even on an
      // unexpected client-side error — the backend already never
      // distinguishes "email not found" from "email sent", and the
      // frontend shouldn't accidentally do so either by showing a
      // different message here.
      setSubmitted(true);
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
        <h3 className="text-center mb-3">🔑 Forgot Password</h3>

        {submitted ? (
          <div className="alert alert-success">
            If an account with that email exists, a password reset
            link has been sent. Please check your inbox (and spam
            folder) — the link expires in 30 minutes.
          </div>
        ) : (
          <>
            <p className="text-muted text-center small mb-4">
              Enter your email and we'll send you a link to reset
              your password.
            </p>

            <div className="btn-group w-100 mb-4" role="group">
              <button
                type="button"
                className={`btn btn-sm ${
                  accountType === "patient"
                    ? "btn-teal"
                    : "btn-outline-teal"
                }`}
                onClick={() => setAccountType("patient")}
              >
                I'm a Patient
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  accountType === "doctor"
                    ? "btn-teal"
                    : "btn-outline-teal"
                }`}
                onClick={() => setAccountType("doctor")}
              >
                I'm a Doctor
              </button>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 text-white btn-teal"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-3">
          <Link to={accountType === "doctor" ? "/doctor-login" : "/login"}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
