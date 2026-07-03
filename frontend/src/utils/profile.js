// src/utils/profile.js
import api from "../api/api";

// ===================== PATIENT =====================

export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await api.put("/profile/me", data);
  return res.data;
};

export const changeMyPassword = async (currentPassword, newPassword) => {
  const res = await api.put("/profile/password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};

// ===================== DOCTOR =====================

export const getMyDoctorProfile = async () => {
  const res = await api.get("/doctors/me");
  return res.data;
};

export const updateMyDoctorProfile = async (data) => {
  const res = await api.put("/doctors/me", data);
  return res.data;
};

export const changeMyDoctorPassword = async (currentPassword, newPassword) => {
  const res = await api.put("/doctors/password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};
