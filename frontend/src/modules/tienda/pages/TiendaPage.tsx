import { Navigate, Route, Routes } from "react-router-dom";

import { ModuleLayout } from "@shared/components";
import { TiendaSidebar } from "@modules/tienda/shared/components/TiendaSidebar";
import { TiendaBottomTabBar } from "@modules/tienda/shared/components/TiendaBottomTabBar";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import styles from "./TiendaPage.module.scss";

export default function TiendaPage() {
  const { isAdmin } = useTiendaRole();

  return (
    <div className={styles.root}>
      <ModuleLayout title="Tienda">
        <div className={styles.layout}>
          {isAdmin && <TiendaSidebar />}
          <main className={styles.content}>
            <Routes>
              <Route index element={<p>Selecciona una opción</p>} />
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </main>
        </div>
        {!isAdmin && <TiendaBottomTabBar />}
      </ModuleLayout>
    </div>
  );
}
