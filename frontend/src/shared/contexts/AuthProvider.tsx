import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@api/client";
import { authEvents } from "@api/authEvents";
import { API } from "@shared/constants/api";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps } from "./types";

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(
    () => Boolean(localStorage.getItem("accessToken")),
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    authEvents.setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    apiClient
      .get(API.USERS_ME)
      .then(() => setIsAuthenticated(true))
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
