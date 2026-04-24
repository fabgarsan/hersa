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

export interface UserMe {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
}
