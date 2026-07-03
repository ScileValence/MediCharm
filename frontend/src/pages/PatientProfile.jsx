// src/pages/PatientProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../utils/profile";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";

export default function PatientProfile() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setName(data.name || "");
      setEmail(data.email || "");
    } catch (err) {
      console.error("❌ Failed to load profile:", err);
      showToast("Failed to load your profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }

    try {
      setSavingName(true);

      const updated = await updateMyProfile({ name: name.trim() });

      // Keep the Navbar/Dashboard greeting in sync without requiring
      // a re-login — they read the cached "user" object, not a fresh
      // fetch, so it has to be refreshed here too.
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, name: updated.name })
      );

      showToast("Profile updated");
    } catch (err) {
      showToast(
        err?.response?.data?.error || "Failed to update profile",
        "error"
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      showToast("Please fill in both password fields", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    try {
      setSavingPassword(true);

      await changeMyPassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showToast("Password updated successfully");
    } catch (err) {
      showToast(
        err?.response?.data?.error || "Failed to update password",
        "error"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border" style={{ color: "var(--brand-500)" }} role="status"></div>
        <p className="text-muted mt-3">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "640px" }}>
      <Toast toast={toast} onClose={clearToast} />

      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Profile</h2>
        <p className="text-muted mb-0">Manage your account details and password.</p>
      </div>

      <div className="card p-4 mb-4">
        <h5 className="fw-semibold mb-3">Account Details</h5>

        <form onSubmit={handleSaveName}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Full Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input
              className="form-control"
              value={email}
              disabled
              readOnly
            />
            <div className="form-text">
              Email cannot be changed after signup.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-teal text-white"
            disabled={savingName}
          >
            {savingName ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card p-4">
        <h5 className="fw-semibold mb-3">Change Password</h5>

        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">
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
            className="btn btn-outline-teal"
            disabled={savingPassword}
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
