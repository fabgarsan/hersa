export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  TIENDA: "/tienda",
  GRADOS: "/grados",
  ADMIN: "/admin",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

export const PUBLIC_ROUTES: string[] = [
  ROUTES.LOGIN,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];
