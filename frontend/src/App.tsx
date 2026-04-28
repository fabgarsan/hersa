import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AuthGuard } from "@shared/components/AuthGuard";
import { ConnectivityIndicator } from "@shared/components/ConnectivityIndicator";
import { Layout } from "@shared/components/Layout";
import { ModuleGuard } from "@shared/components/ModuleGuard";
import { ROUTES } from "@shared/constants/routes";
import { AuthModal } from "@modules/auth";
import { TiendaPage } from "@modules/tienda";
import { GradosPage } from "@modules/grados";
import { AdminPage } from "@modules/admin";
import { ForgotPasswordPage, ProfilePage, ResetPasswordPage } from "@modules/profile";
import styles from "./App.module.scss";

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
      <AuthGuard>
      <Routes>
        {/* Public routes — no layout */}
        <Route path={ROUTES.LOGIN} element={<AuthModal />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

        {/* Protected routes — wrapped in Layout via ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.PROFILE} replace />} />
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
        </Route>
      </Routes>
    </AuthGuard>
    </>
  );
}
