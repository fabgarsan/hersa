import axios from "axios";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

import { API } from "@shared/constants/api";
import { authEvents } from "./authEvents";

export function isApiErrorData(data: unknown): data is Record<string, unknown> {
  return typeof data === "object" && data !== null;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request: attach JWT + convert camelCase body to snake_case
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data) {
    config.data = snakecaseKeys(config.data as Record<string, unknown>, { deep: true });
  }
  return config;
});

// Shared promise across all concurrent 401s — prevents multiple simultaneous refresh calls
let refreshPromise: Promise<string> | null = null;

// Response: convert snake_case data to camelCase
// Error: attempt silent token refresh on 401, serializing concurrent refreshes via mutex
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = camelcaseKeys(response.data as Record<string, unknown>, { deep: true });
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${BASE_URL}${API.TOKEN_REFRESH}`, { refresh })
              .then(({ data }) => {
                localStorage.setItem("accessToken", data.access);
                if (data.refresh) {
                  localStorage.setItem("refreshToken", data.refresh);
                }
                return data.access as string;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }
          const newToken = await refreshPromise;
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        } catch {
          authEvents.triggerLogout();
        }
      }
    }
    return Promise.reject(error);
  },
);
