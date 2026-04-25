import { createContext } from "react";

import type { AuthContextValue } from "./types";

export type { AuthContextValue };

export const AuthContext = createContext<AuthContextValue | null>(null);
