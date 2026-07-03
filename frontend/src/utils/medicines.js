// src/utils/medicines.js
import api from "../api/api";

// ✅ fetch all medicines from backend
export const getProducts = async () => {
  const res = await api.get("/medicines/all");
  return res.data;
};
