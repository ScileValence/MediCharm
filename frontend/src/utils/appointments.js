import api from "../api/api";

// ✅ fetch appointments by user
export const getAppointments = async (userId) => {
  const res = await api.get(`/appointments/user/${userId}`);
  return res.data;
};

// ✅ fetch FULL appointment history (includes cancelled/completed/rejected)
export const getAppointmentHistory = async (userId) => {
  const res = await api.get(`/appointments/user/${userId}/history`);
  return res.data;
};

// ✅ cancel appointment by ID
export const deleteAppointment = async (id) => {
  try {
    const res = await api.put(`/appointments/${id}/cancel`);
    console.log("Appointment cancelled:", res.data);
    return res.data;
  } catch (err) {
    console.error("Failed to cancel appointment:", err);
    throw err;
  }
};