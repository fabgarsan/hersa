import { Navigate, useLocation } from "react-router-dom";

import { useAuthContext } from "@shared/contexts";
import { PUBLIC_ROUTES, ROUTES } from "@shared/constants/routes";
import type { AuthGuardProps } from "./types";
import styles from "./AuthGuard.module.scss";

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuthContext();
  const { pathname } = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (isAuthenticated && isPublicRoute) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <div className={styles.root}>{children}</div>;
}
