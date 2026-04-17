import axios from "axios";

export const authAPI = axios.create({
  /*baseURL: "http://127.0.0.1:8001",*/
  baseURL: import.meta.env.VITE_AUTH_API,
  headers: {
    "Content-Type": "application/json"
  }
});

export const mainAPI = axios.create({
  /*baseURL: "http://127.0.0.1:8002",*/
  baseURL: import.meta.env.VITE_MAIN_API,
  headers: {
    "Content-Type": "application/json"
  }
});

mainAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const extractError = (error) => {
  if (error?.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((item) => item.msg).join(", ");
    }
    return error.response.data.detail;
  }
  return error.message || "Network Error";
};