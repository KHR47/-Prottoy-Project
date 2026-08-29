import axios from "axios";
import { logout } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Only clear if the request had an authorization token that was rejected
      const authHeader = error.config?.headers?.Authorization;
      if (authHeader) {
        logout();
      }
    }
    return Promise.reject(error);
  }
);
