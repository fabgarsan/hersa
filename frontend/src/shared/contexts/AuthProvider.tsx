import { useCallback, useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@api/client";
import { authEvents } from "@api/authEvents";
import { API } from "@shared/constants/api";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps } from "./types";

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(
    () => Boolean(localStorage.getItem("accessToken")),
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Purge the React Query in-memory cache so stale server-state data
    // is not accessible after logout on a shared device.
    queryClient.clear();
    // Purge the persisted cache written by PersistQueryClientProvider
    // (key defined in main.tsx: "hersa-rq-cache").
    localStorage.removeItem("hersa-rq-cache");
    // Clear the Workbox API runtime cache so the service worker does not
    // serve authenticated responses to the next user.
    if ("caches" in window) {
      void caches.delete("api-cache");
    }
    setIsAuthenticated(false);
  }, [queryClient]);

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
