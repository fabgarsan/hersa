import type { z } from "zod";

import type { loginSchema } from "./schemas";

export interface TokenPair {
  access: string;
  refresh: string;
}

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface UseAuthReturn {
  isAuthenticated: boolean;
  logout: () => void;
}
