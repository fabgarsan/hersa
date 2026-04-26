import { useCallback, useEffect, useState } from "react";

import { authEvents } from "@api/authEvents";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps } from "./types";

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => Boolean(localStorage.getItem("accessToken")),
  );

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setIsAuthenticated(true);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    authEvents.setLogoutCallback(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
