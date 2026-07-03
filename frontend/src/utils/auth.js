// src/utils/auth.js
import api from "../api/api";

// ✅ login user with backend
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  const { user, token } = res.data;
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("userLoggedIn", "true");
  return user;
};

// ✅ signup new user with backend
export const signupUser = async (name, email, password) => {
  const res = await api.post("/auth/signup", { name, email, password });
  const { user, token } = res.data;
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  localStorage.setItem("userLoggedIn", "true");
  return user;
};

// ✅ check login
export const isLoggedIn = () => localStorage.getItem("userLoggedIn") === "true";

// ✅ logout
export const logoutUser = () => {
  localStorage.clear();
};

// ✅ request a password reset email. accountType is "patient" or
// "doctor" — always resolves successfully regardless of whether the
// email exists, matching the backend's deliberate non-leaking
// response.
export const forgotPassword = async (email, accountType = "patient") => {
  const res = await api.post("/auth/forgot-password", {
    email,
    accountType: accountType.toUpperCase(),
  });
  return res.data;
};

// ✅ complete a password reset using the token from the emailed link
export const resetPassword = async (token, newPassword) => {
  const res = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return res.data;
};
