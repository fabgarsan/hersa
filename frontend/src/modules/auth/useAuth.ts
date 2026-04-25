import { useAuthContext } from "@shared/contexts";
import type { UseAuthReturn } from "./types";

export const useAuth = (): UseAuthReturn => {
  const { isAuthenticated, logout } = useAuthContext();
  return { isAuthenticated, logout };
};
