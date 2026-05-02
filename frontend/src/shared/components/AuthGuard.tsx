import { Navigate, useLocation } from "react-router-dom";

import { useAuthContext } from "@shared/contexts";
import { PUBLIC_ROUTES, ROUTES } from "@shared/constants/routes";
import type { AuthGuardProps } from "./types";
import styles from "./AuthGuard.module.scss";

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  if (isLoading) {
    return <div className={styles.root} />;
  }

  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (isAuthenticated && isPublicRoute) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    return <Navigate to={from ?? ROUTES.HOME} replace />;
  }

  return <div className={styles.root}>{children}</div>;
}
