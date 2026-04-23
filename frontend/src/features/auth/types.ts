export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UseAuthReturn {
  isAuthenticated: boolean;
  logout: () => void;
}
