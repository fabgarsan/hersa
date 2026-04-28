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

// TODO: replace with generated type once backend runs `npm run generate:types`.
// The source will be:
//   import type { components } from "@api/generated/types";
//   type UserMeRaw = components["schemas"]["UserMe"]; // snake_case from schema
// Because the axios interceptor converts snake_case → camelCase before any
// consumer sees the data, we define the camelCase shape here and keep it as
// the authoritative runtime type.
export interface UserMe {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}
