import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Layout } from "@shared/components/Layout";
import { ModuleGuard } from "@shared/components/ModuleGuard";
import { ROUTES } from "@shared/constants/routes";
import { AuthModal, useAuth } from "@modules/auth";
import { TiendaPage } from "@modules/tienda";
import { GradosPage } from "@modules/grados";
import { AdminPage } from "@modules/admin";
import { ForgotPasswordPage, ProfilePage, ResetPasswordPage } from "@modules/profile";

export default function App() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  const isPublicPath = pathname === ROUTES.FORGOT_PASSWORD || pathname === ROUTES.RESET_PASSWORD;

  if (!isAuthenticated && !isPublicPath) {
    return <AuthModal />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.PROFILE} replace />} />
        <Route path={ROUTES.TIENDA} element={<ModuleGuard module="modules.access_tienda"><TiendaPage /></ModuleGuard>} />
        <Route path={ROUTES.GRADOS} element={<ModuleGuard module="modules.access_programador"><GradosPage /></ModuleGuard>} />
        <Route path={ROUTES.ADMIN} element={<AdminPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
      </Routes>
    </Layout>
  );
}
