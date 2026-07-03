// src/utils/admin.js
import api from "../api/api";

// ===================== AUTH =====================

// Admins are just `users` rows with role === "ADMIN", so admin login
// reuses the existing patient login endpoint. We only persist the
// session if the returned user is actually an admin.
export const loginAdmin = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  const { user, token } = res.data;

  if (!user || user.role !== "ADMIN") {
    throw new Error("This account does not have admin access");
  }

  localStorage.setItem("admin", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("adminLoggedIn", "true");

  return user;
};

export const isAdminLoggedIn = () =>
  localStorage.getItem("adminLoggedIn") === "true";

export const getAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("admin"));
  } catch {
    return null;
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem("admin");
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("token");
};

// ===================== DASHBOARD =====================

export const fetchStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

// ===================== DOCTORS =====================

export const fetchAllDoctors = async () => {
  const res = await api.get("/doctors/all");
  return res.data;
};

export const fetchDepartments = async () => {
  const res = await api.get("/doctors/departments");
  return res.data;
};

export const createDoctor = async (doctor) => {
  const res = await api.post("/admin/doctors", doctor);
  return res.data;
};

export const resetDoctorPassword = async (id) => {
  const res = await api.post(`/admin/doctors/${id}/reset-password`);
  return res.data;
};

export const approveDoctor = async (id) => {
  const res = await api.put(`/doctors/approve/${id}`);
  return res.data;
};

export const rejectDoctor = async (id) => {
  const res = await api.put(`/doctors/reject/${id}`);
  return res.data;
};

export const suspendDoctor = async (id) => {
  const res = await api.put(`/doctors/suspend/${id}`);
  return res.data;
};

export const deleteDoctor = async (id) => {
  const res = await api.delete(`/doctors/${id}`);
  return res.data;
};

// ===================== USERS =====================

export const fetchAllUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const resetUserPassword = async (id) => {
  const res = await api.post(`/admin/users/${id}/reset-password`);
  return res.data;
};

// ===================== APPOINTMENTS =====================

export const fetchAllAppointments = async () => {
  const res = await api.get("/admin/appointments");
  return res.data;
};

export const cancelAppointmentAdmin = async (id) => {
  const res = await api.put(`/admin/appointments/${id}/cancel`);
  return res.data;
};

export const deleteAppointmentAdmin = async (id) => {
  const res = await api.delete(`/admin/appointments/${id}`);
  return res.data;
};

// ===================== ORDERS =====================

export const fetchAllOrders = async () => {
  const res = await api.get("/admin/orders");
  return res.data;
};

export const cancelOrderAdmin = async (id) => {
  const res = await api.put(`/admin/orders/${id}/cancel`);
  return res.data;
};

export const deleteOrderAdmin = async (id) => {
  const res = await api.delete(`/admin/orders/${id}`);
  return res.data;
};

// ===================== REPORTS =====================

export const fetchAllReports = async () => {
  const res = await api.get("/admin/reports");
  return res.data;
};

export const deleteReportAdmin = async (id) => {
  const res = await api.delete(`/admin/reports/${id}`);
  return res.data;
};
