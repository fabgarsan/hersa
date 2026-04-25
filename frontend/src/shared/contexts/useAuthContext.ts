import { useContext } from "react";

import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
