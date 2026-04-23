import type { UseAuthReturn } from "./types";

export const useAuth = (): UseAuthReturn => {
  const token = localStorage.getItem("access_token");
  const isAuthenticated = Boolean(token);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/";
  };

  return { isAuthenticated, logout };
};
