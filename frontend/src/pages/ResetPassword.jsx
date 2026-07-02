// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../utils/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const accountType = searchParams.get("type") || "patient";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(
        "This reset link is missing its token. Please use the link from your email exactly as sent."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        "Failed to reset password. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const loginPath = accountType === "doctor" ? "/doctor-login" : "/login";

  return (
    <div className="container py-4">
      <div
        className="card p-4 mx-auto"
        style={{ maxWidth: "450px" }}
      >
        <h3 className="text-center mb-3">🔒 Reset Password</h3>

        {success ? (
          <>
            <div className="alert alert-success">
              Your password has been reset successfully.
            </div>
            <button
              className="btn w-100 text-white btn-teal"
              onClick={() => navigate(loginPath)}
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            {!token && (
              <div className="alert alert-warning py-2">
                No reset token found in this link. Please use the
                link from your email, or request a new one.
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 text-white btn-teal"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="text-center mt-3">
              <Link to="/forgot-password">Request a new link</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
