// src/utils/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // change to true if you later use cookies/session auth
});

export default api;
