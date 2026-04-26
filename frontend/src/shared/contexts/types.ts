export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
