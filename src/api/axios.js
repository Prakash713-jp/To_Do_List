import axios from "axios";

const api = axios.create({
  baseURL: "https://your-backend-api-rlbv.onrender.com/api", // ✅ updated
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
