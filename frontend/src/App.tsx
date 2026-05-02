import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { offlineMutationEvents } from "@api/offlineMutationEvents";
import { AuthGuard } from "@shared/components/AuthGuard";
import { ConnectivityIndicator } from "@shared/components/ConnectivityIndicator";
import { LoadingState } from "@shared/components/LoadingState";
import { OfflineMutationDialog } from "@shared/components/OfflineMutationDialog";
import { Layout } from "@shared/components/Layout";
import { ModuleGuard } from "@shared/components/ModuleGuard";
import { ROUTES } from "@shared/constants/routes";
import { usePermissions } from "@shared/hooks/usePermissions";
import { AuthModal } from "@modules/auth";
import { TiendaPage } from "@modules/tienda";
import { GradosPage } from "@modules/grados";
import { AdminPage } from "@modules/admin";
import { ForgotPasswordPage, ProfilePage, ResetPasswordPage } from "@modules/profile";
import { NotFoundPage } from "@modules/not-found";
import styles from "./App.module.scss";

function SmartRedirect() {
  const { hasAccess, isLoading } = usePermissions();
  if (isLoading) return <LoadingState />;
  if (hasAccess("modules.access_programador")) return <Navigate to={ROUTES.GRADOS} replace />;
  if (hasAccess("modules.access_tienda")) return <Navigate to={ROUTES.TIENDA} replace />;
  if (hasAccess("modules.access_admin")) return <Navigate to={ROUTES.ADMIN} replace />;
  return <Navigate to={ROUTES.PROFILE} replace />;
}

function GlobalOfflineMutationDialog() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    offlineMutationEvents.register(() => setOpen(true));
    return () => offlineMutationEvents.unregister();
  }, []);
  return <OfflineMutationDialog open={open} onClose={() => setOpen(false)} />;
}

function ProtectedLayout() {
  return (
    <div className={styles.root}>
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ConnectivityIndicator />
      <GlobalOfflineMutationDialog />
      <AuthGuard>
        <Routes>
          {/* Public routes — no layout */}
          <Route path={ROUTES.LOGIN} element={<AuthModal />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage fullPage />} />

          {/* Protected routes — wrapped in Layout via ProtectedLayout */}
          <Route element={<ProtectedLayout />}>
            <Route path={ROUTES.HOME} element={<SmartRedirect />} />
            <Route
              path={ROUTES.TIENDA}
              element={
                <ModuleGuard module="modules.access_tienda">
                  <TiendaPage />
                </ModuleGuard>
              }
            />
            <Route
              path={ROUTES.GRADOS}
              element={
                <ModuleGuard module="modules.access_programador">
                  <GradosPage />
                </ModuleGuard>
              }
            />
            <Route
              path={ROUTES.ADMIN}
              element={
                <ModuleGuard module="modules.access_admin">
                  <AdminPage />
                </ModuleGuard>
              }
            />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthGuard>
    </>
  );
}
