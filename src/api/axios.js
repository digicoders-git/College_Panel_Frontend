import axios from "axios";
import { loadingStore } from "../utils/loadingStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  loadingStore.start();
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => {
  loadingStore.stop();
  return Promise.reject(err);
});

api.interceptors.response.use(
  (res) => {
    loadingStore.stop();
    return res;
  },
  (err) => {
    loadingStore.stop();
    // sirf tab redirect karo jab token exist karta ho aur 401 aaye (token expire)
    // login attempt pe 401 aaye to redirect mat karo
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
