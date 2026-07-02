// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import StatusPill from "../components/ui/StatusPill";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import {
  CalendarIcon,
  PillIcon,
  FileTextIcon,
} from "../components/ui/icons";
import {
  getAdmin,
  fetchStats,
  fetchAllDoctors,
  fetchDepartments,
  createDoctor,
  approveDoctor,
  rejectDoctor,
  suspendDoctor,
  deleteDoctor,
  resetDoctorPassword,
  fetchAllUsers,
  deleteUser,
  resetUserPassword,
  fetchAllAppointments,
  cancelAppointmentAdmin,
  deleteAppointmentAdmin,
  fetchAllOrders,
  cancelOrderAdmin,
  deleteOrderAdmin,
  fetchAllReports,
  deleteReportAdmin,
} from "../utils/admin";

const TABS = [
  { key: "doctors", label: "Doctors" },
  { key: "users", label: "Users" },
  { key: "appointments", label: "Appointments" },
  { key: "orders", label: "Orders" },
  { key: "reports", label: "Reports" },
];

const STAT_TONES = {
  primary: "var(--brand-500)",
  success: "var(--status-confirmed)",
  info: "var(--status-info)",
  warning: "var(--status-pending)",
  secondary: "var(--gray-400)",
};

function StatCard({ label, value, sub, color }) {
  const tone = STAT_TONES[color] || "var(--gray-400)";
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div
        className="card text-center p-3"
        style={{ borderLeft: `3px solid ${tone}` }}
      >
        <div className="fs-3 fw-bold" style={{ fontFamily: "Lexend, sans-serif" }}>
          {value ?? "—"}
        </div>
        <div className="text-muted small">{label}</div>
        {sub && <div className="text-muted" style={{ fontSize: "0.75rem" }}>{sub}</div>}
      </div>
    </div>
  );
}

const EMPTY_DOCTOR_FORM = {
  name: "",
  email: "",
  password: "",
  dept: "",
  phone: "",
  qualification: "",
  specialization: "",
  experienceYears: "",
  consultationFee: "",
  hospital: "",
};

function AddDoctorForm({ onCreated, existingDepartments }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_DOCTOR_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [addingNewDept, setAddingNewDept] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleDeptSelect = (e) => {
    const value = e.target.value;

    if (value === "__NEW__") {
      setAddingNewDept(true);
      setForm((prev) => ({ ...prev, dept: "" }));
      return;
    }

    setAddingNewDept(false);
    setForm((prev) => ({ ...prev, dept: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.dept.trim()) {
      setError("Name, email, password, and department are required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        dept: form.dept.trim(),
        phone: form.phone.trim() || null,
        qualification: form.qualification.trim() || null,
        specialization: form.specialization.trim() || null,
        hospital: form.hospital.trim() || null,
        experienceYears: form.experienceYears
          ? Number(form.experienceYears)
          : null,
        consultationFee: form.consultationFee
          ? Number(form.consultationFee)
          : null,
      };

      const created = await createDoctor(payload);

      onCreated(created);
      setForm(EMPTY_DOCTOR_FORM);
      setAddingNewDept(false);
      setOpen(false);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        "Failed to create doctor"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        className="btn btn-teal text-white mb-3"
        onClick={() => setOpen(true)}
      >
        + Add Doctor
      </button>
    );
  }

  return (
    <div className="card p-3 mb-4" style={{ background: "var(--gray-50)" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-semibold">Add a New Doctor</h6>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
        >
          Cancel
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold">
              Full Name *
            </label>
            <input
              className="form-control"
              value={form.name}
              onChange={update("name")}
              placeholder="Dr. Jane Doe"
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold">
              Department *
            </label>

            {!addingNewDept ? (
              <select
                className="form-select"
                value={form.dept}
                onChange={handleDeptSelect}
                required
              >
                <option value="" disabled>
                  Select a department
                </option>
                {existingDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="__NEW__">+ Add new department...</option>
              </select>
            ) : (
              <div className="d-flex gap-2">
                <input
                  className="form-control"
                  value={form.dept}
                  onChange={update("dept")}
                  placeholder="e.g. Endocrinology"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setAddingNewDept(false);
                    setForm((prev) => ({ ...prev, dept: "" }));
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold">
              Email *
            </label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={update("email")}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold">
              Temporary Password *
            </label>
            <input
              type="text"
              className="form-control"
              value={form.password}
              onChange={update("password")}
              placeholder="Doctor can change this later"
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">
              Phone
            </label>
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
            <label className="form-label small fw-semibold">
              Hospital
            </label>
            <input
              className="form-control"
              value={form.hospital}
              onChange={update("hospital")}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-teal text-white mt-3"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Doctor"}
        </button>

        <p className="text-muted small mt-2 mb-0">
          Doctors added here are auto-approved and can log in right
          away with the email and password above.
        </p>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  const admin = getAdmin();
  const { toast, showToast, clearToast } = useToast();

  // Holds a just-generated temp password so it can be shown in a
  // persistent, dismissible banner rather than a toast — unlike a
  // normal success message, this is the ONLY time the plaintext
  // password is ever visible, so it shouldn't auto-disappear after
  // a few seconds while the admin is still trying to copy it.
  const [revealedPassword, setRevealedPassword] = useState(null);

  const [activeTab, setActiveTab] = useState("doctors");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        statsRes,
        doctorsRes,
        departmentsRes,
        usersRes,
        appointmentsRes,
        ordersRes,
        reportsRes,
      ] = await Promise.all([
        fetchStats(),
        fetchAllDoctors(),
        fetchDepartments(),
        fetchAllUsers(),
        fetchAllAppointments(),
        fetchAllOrders(),
        fetchAllReports(),
      ]);

      setStats(statsRes);
      setDoctors(doctorsRes || []);
      setDepartments(departmentsRes || []);
      setUsers(usersRes || []);
      setAppointments(appointmentsRes || []);
      setOrders(ordersRes || []);
      setReports(reportsRes || []);

    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
      setError("Failed to load some dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== DOCTOR ACTIONS =====================

  const handleApproveDoctor = async (id) => {
    try {
      await approveDoctor(id);
      const updated = await fetchAllDoctors();
      setDoctors(updated || []);
      showToast("Doctor approved");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to approve doctor", "error");
    }
  };

  const handleRejectDoctor = async (id) => {
    if (!window.confirm("Reject this doctor's application?")) return;
    try {
      await rejectDoctor(id);
      const updated = await fetchAllDoctors();
      setDoctors(updated || []);
      showToast("Doctor application rejected");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to reject doctor", "error");
    }
  };

  const handleSuspendDoctor = async (id) => {
    if (!window.confirm("Suspend this doctor's account? They will not be able to log in.")) return;
    try {
      await suspendDoctor(id);
      const updated = await fetchAllDoctors();
      setDoctors(updated || []);
      showToast("Doctor suspended");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to suspend doctor", "error");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Permanently delete this doctor? This cannot be undone.")) return;
    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      showToast("Doctor deleted");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to delete doctor", "error");
    }
  };

  const handleResetDoctorPassword = async (doc) => {
    if (!window.confirm(
      `Generate a new temporary password for ${doc.name}? Their current password will stop working immediately.`
    )) return;

    try {
      const { temporaryPassword } = await resetDoctorPassword(doc.id);
      setRevealedPassword({
        name: doc.name,
        email: doc.email,
        password: temporaryPassword,
      });
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to reset password", "error");
    }
  };

  // ===================== USER ACTIONS =====================

  const handleDeleteUser = async (id) => {
    if (!window.confirm(
      "Permanently delete this patient? Their appointments and reports will also be removed. This cannot be undone."
    )) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("Patient deleted");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to delete user", "error");
    }
  };

  const handleResetUserPassword = async (user) => {
    if (!window.confirm(
      `Generate a new temporary password for ${user.name}? Their current password will stop working immediately.`
    )) return;

    try {
      const { temporaryPassword } = await resetUserPassword(user.id);
      setRevealedPassword({
        name: user.name,
        email: user.email,
        password: temporaryPassword,
      });
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to reset password", "error");
    }
  };

  // ===================== APPOINTMENT ACTIONS =====================

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const updated = await cancelAppointmentAdmin(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      showToast("Appointment cancelled");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to cancel appointment", "error");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Permanently delete this appointment record?")) return;
    try {
      await deleteAppointmentAdmin(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      showToast("Appointment deleted");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to delete appointment", "error");
    }
  };

  // ===================== ORDER ACTIONS =====================

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const updated = await cancelOrderAdmin(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast("Order cancelled");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to cancel order", "error");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Permanently delete this order record?")) return;
    try {
      await deleteOrderAdmin(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showToast("Order deleted");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to delete order", "error");
    }
  };

  // ===================== REPORT ACTIONS =====================

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Permanently delete this report and its attachment?")) return;
    try {
      await deleteReportAdmin(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      showToast("Report deleted");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to delete report", "error");
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="mb-4">
          <div className="skeleton mb-2" style={{ height: "1.75rem", width: "260px" }} />
          <div className="skeleton" style={{ height: "1rem", width: "180px" }} />
        </div>
        <div className="row g-3 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="col-6 col-md-4 col-lg-2" key={i}>
              <div className="card p-3">
                <div className="skeleton mb-2" style={{ height: "1.5rem", width: "50%" }} />
                <div className="skeleton" style={{ height: "0.8rem", width: "70%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Toast toast={toast} onClose={clearToast} />

      {revealedPassword && (
        <div
          className="card p-3 mb-4 d-flex flex-row justify-content-between align-items-start gap-3"
          style={{ borderLeft: "3px solid var(--status-pending)" }}
        >
          <div>
            <strong>New temporary password for {revealedPassword.name}</strong>
            <div className="text-muted small mb-2">
              {revealedPassword.email} — share this with them directly;
              it will not be shown again.
            </div>
            <code className="fs-5 user-select-all" style={{ color: "var(--brand-600)" }}>
              {revealedPassword.password}
            </code>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setRevealedPassword(null)}
          ></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">
            Manage doctors, patients, and platform activity.
          </p>
        </div>
        <span className="text-muted small">
          Signed in as {admin?.name || admin?.email}
        </span>
      </div>

      {error && <ErrorState body={error} onRetry={loadAll} />}

      {/* ===== Stat Cards ===== */}
      {stats && (
        <div className="row g-3 mb-4">
          <StatCard label="Patients" value={stats.totalPatients} color="primary" />
          <StatCard
            label="Doctors"
            value={stats.totalDoctors}
            sub={`${stats.pendingDoctors} pending`}
            color="success"
          />
          <StatCard
            label="Appointments"
            value={stats.totalAppointments}
            sub={`${stats.activeAppointments} active`}
            color="info"
          />
          <StatCard
            label="Orders"
            value={stats.totalOrders}
            sub={`${stats.activeOrders} active`}
            color="warning"
          />
          <StatCard label="Reports" value={stats.totalReports} color="secondary" />
        </div>
      )}

      {/* ===== Tabs ===== */}
      <ul className="nav nav-tabs mb-4">
        {TABS.map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key === "doctors" && stats?.pendingDoctors > 0 && (
                <span
                  className="badge ms-2"
                  style={{
                    background: "var(--status-pending-tint)",
                    color: "var(--status-pending)",
                  }}
                >
                  {stats.pendingDoctors}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === "doctors" && (
        <div className="card p-4">
          <h5 className="fw-semibold mb-3">Doctors</h5>

          <AddDoctorForm
            existingDepartments={departments}
            onCreated={(created) => {
              setDoctors((prev) => [...prev, created]);

              setDepartments((prev) =>
                prev.includes(created.dept)
                  ? prev
                  : [...prev, created.dept].sort()
              );
            }}
          />

          {doctors.length === 0 ? (
            <EmptyState title="No doctors registered yet" />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc, index) => (
                    <tr key={doc.id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{doc.name}</td>
                      <td className="text-muted">{doc.email}</td>
                      <td>
                        {doc.dept && <span className="tag-chip">{doc.dept}</span>}
                      </td>
                      <td><StatusPill status={doc.status} /></td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {doc.status !== "APPROVED" && (
                            <button
                              className="btn btn-sm btn-teal text-white"
                              onClick={() => handleApproveDoctor(doc.id)}
                            >
                              Approve
                            </button>
                          )}
                          {doc.status !== "REJECTED" && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleRejectDoctor(doc.id)}
                            >
                              Reject
                            </button>
                          )}
                          {doc.status === "APPROVED" && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleSuspendDoctor(doc.id)}
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleResetDoctorPassword(doc)}
                          >
                            Reset Password
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleDeleteDoctor(doc.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="card p-4">
          <h5 className="fw-semibold mb-3">Patients</h5>

          {users.length === 0 ? (
            <EmptyState title="No patients registered yet" />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{user.name}</td>
                      <td className="text-muted">{user.email}</td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleResetUserPassword(user)}
                          >
                            Reset Password
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="card p-4">
          <h5 className="fw-semibold mb-3">Appointments</h5>

          {appointments.length === 0 ? (
            <EmptyState icon={CalendarIcon} title="No appointments found" />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>When</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt, index) => (
                    <tr key={appt.id}>
                      <td>{index + 1}</td>
                      <td>{appt.user?.name || "Unknown"}</td>
                      <td>{appt.doctor?.name || "Unknown"}</td>
                      <td>
                        {appt.dept && <span className="tag-chip">{appt.dept}</span>}
                      </td>
                      <td className="text-muted">
                        {appt.appointmentTime
                          ? new Date(appt.appointmentTime).toLocaleString()
                          : "—"}
                      </td>
                      <td><StatusPill status={appt.status} /></td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleCancelAppointment(appt.id)}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleDeleteAppointment(appt.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="card p-4">
          <h5 className="fw-semibold mb-3">Medicine Orders</h5>

          {orders.length === 0 ? (
            <EmptyState icon={PillIcon} title="No orders found" />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Placed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order.id}>
                      <td>{index + 1}</td>
                      <td>{order.user?.name || "Unknown"}</td>
                      <td>{order.items?.length ?? 0}</td>
                      <td className="fw-semibold">
                        ₹{order.total?.toFixed ? order.total.toFixed(2) : order.total}
                      </td>
                      <td><StatusPill status={order.status} /></td>
                      <td className="text-muted">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {order.status !== "CANCELLED" && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <div className="card p-4">
          <h5 className="fw-semibold mb-3">Medical Reports</h5>

          {reports.length === 0 ? (
            <EmptyState icon={FileTextIcon} title="No reports found" />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Created</th>
                    <th>Attachment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>
                      <td>{report.user?.name || "Unknown"}</td>
                      <td>{report.doctorName || "—"}</td>
                      <td>
                        {report.department && (
                          <span className="tag-chip">{report.department}</span>
                        )}
                      </td>
                      <td className="text-muted">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{report.reportFile ? "Yes" : "—"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
