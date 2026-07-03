// src/pages/DoctorProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
  changeMyDoctorPassword,
} from "../utils/profile";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import StatusPill from "../components/ui/StatusPill";

const EMPTY_FORM = {
  name: "",
  phone: "",
  dept: "",
  qualification: "",
  specialization: "",
  experienceYears: "",
  consultationFee: "",
  hospital: "",
  available: true,
};

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("doctor");

    if (!stored) {
      navigate("/doctor-login");
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyDoctorProfile();

      setEmail(data.email || "");
      setStatus(data.status || "");
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        dept: data.dept || "",
        qualification: data.qualification || "",
        specialization: data.specialization || "",
        experienceYears: data.experienceYears ?? "",
        consultationFee: data.consultationFee ?? "",
        hospital: data.hospital || "",
        available: data.available !== false,
      });
    } catch (err) {
      console.error("❌ Failed to load doctor profile:", err);
      showToast("Failed to load your profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.dept.trim()) {
      showToast("Name and department cannot be empty", "error");
      return;
    }

    try {
      setSavingProfile(true);

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        dept: form.dept.trim(),
        qualification: form.qualification.trim() || null,
        specialization: form.specialization.trim() || null,
        hospital: form.hospital.trim() || null,
        experienceYears:
          form.experienceYears === "" ? null : Number(form.experienceYears),
        consultationFee:
          form.consultationFee === "" ? null : Number(form.consultationFee),
        available: form.available,
      };

      const updated = await updateMyDoctorProfile(payload);

      // Keep the Navbar/Dashboard greeting in sync without requiring
      // a re-login.
      const stored = JSON.parse(localStorage.getItem("doctor") || "{}");
      localStorage.setItem(
        "doctor",
        JSON.stringify({ ...stored, name: updated.name, dept: updated.dept })
      );

      showToast("Profile updated");
    } catch (err) {
      showToast(
        err?.response?.data?.error || "Failed to update profile",
        "error"
      );
    } finally {
      setSavingProfile(false);
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

      await changeMyDoctorPassword(currentPassword, newPassword);

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
    <div className="container py-4" style={{ maxWidth: "720px" }}>
      <Toast toast={toast} onClose={clearToast} />

      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Profile</h2>
        <p className="text-muted mb-0">
          Manage your professional details and password.
        </p>
      </div>

      <div className="card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="fw-semibold mb-0">Professional Details</h5>
          <StatusPill status={status} />
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">
                Full Name *
              </label>
              <input
                className="form-control"
                value={form.name}
                onChange={update("name")}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Email</label>
              <input className="form-control" value={email} disabled readOnly />
              <div className="form-text">
                Email cannot be changed after registration.
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">
                Department *
              </label>
              <input
                className="form-control"
                value={form.dept}
                onChange={update("dept")}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Phone</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={update("phone")}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">
                Experience (years)
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.experienceYears}
                onChange={update("experienceYears")}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.consultationFee}
                onChange={update("consultationFee")}
              />
            </div>

            <div className="col-12 col-md-4 d-flex align-items-end">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="availableSwitch"
                  checked={form.available}
                  onChange={update("available")}
                />
                <label
                  className="form-check-label small fw-semibold"
                  htmlFor="availableSwitch"
                >
                  Available for booking
                </label>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">
                Qualification
              </label>
              <input
                className="form-control"
                value={form.qualification}
                onChange={update("qualification")}
                placeholder="MBBS, MD (Cardiology)"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">
                Specialization
              </label>
              <input
                className="form-control"
                value={form.specialization}
                onChange={update("specialization")}
                placeholder="Heart Failure & Hypertension"
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Hospital</label>
              <input
                className="form-control"
                value={form.hospital}
                onChange={update("hospital")}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-3"
            disabled={savingProfile}
          >
            {savingProfile ? "Saving..." : "Save Changes"}
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
            className="btn btn-outline-primary"
            disabled={savingPassword}
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
