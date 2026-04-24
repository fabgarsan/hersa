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

export interface UserMe {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}
