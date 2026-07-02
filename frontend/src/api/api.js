import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
baseURL: BASE_URL,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {

const token = localStorage.getItem("token");

if (token) {
config.headers.Authorization = `Bearer ${token}`;
}

return config;
});

export default api;
