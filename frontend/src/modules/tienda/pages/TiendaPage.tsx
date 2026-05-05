import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";

import { ModuleLayout } from "@shared/components";
import { TiendaSidebar } from "@modules/tienda/shared/components/TiendaSidebar";
import { TiendaBottomTabBar } from "@modules/tienda/shared/components/TiendaBottomTabBar";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import {
  ProductoListPage,
  ProductoFormPage,
  ProductoDetailPage,
  ProveedorListPage,
  ProveedorFormPage,
} from "@modules/tienda/features/catalogo";
import {
  OrdenListPage,
  OrdenCreatePage,
  OrdenDetailPage,
  OrdenEditInitiatedPage,
  RecepcionFormPage,
} from "@modules/tienda/features/compras";
import {
  VendedorHomePage,
  JornadaOpenPage,
  TrasladoAperturaPage,
  TrasladoConfirmPage,
  ReposicionPage,
  CierreConteoPage,
  CierreDineroPage,
  CierreResumenPage,
  JornadaListPage,
  JornadaDetailPage,
} from "@modules/tienda/features/jornada";
import {
  StockPage,
  ReabastecimientoPage,
  AjusteListPage,
  AjusteFormPage,
} from "@modules/tienda/features/inventario";
import styles from "./TiendaPage.module.scss";

export default function TiendaPage() {
  const { isAdmin } = useTiendaRole();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [tiendaSidebarOpen, setTiendaSidebarOpen] = useState(false);

  return (
    <div className={styles.root}>
      <ModuleLayout
        title="Tienda"
        actions={
          isAdmin && !isMdUp ? (
            <IconButton
              color="primary"
              aria-label="abrir menú tienda"
              onClick={() => setTiendaSidebarOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : undefined
        }
      >
        <div className={styles.layout}>
          {isAdmin && (
            <TiendaSidebar
              mobileOpen={tiendaSidebarOpen}
              onMobileClose={() => setTiendaSidebarOpen(false)}
            />
          )}
          <main className={styles.content}>
            <Routes>
              <Route index element={<p>Selecciona una opción</p>} />
              <Route path="productos" element={<ProductoListPage />} />
              <Route path="productos/nuevo" element={<ProductoFormPage />} />
              <Route path="productos/:id" element={<ProductoDetailPage />} />
              <Route path="productos/:id/editar" element={<ProductoFormPage />} />
              <Route path="proveedores" element={<ProveedorListPage />} />
              <Route path="proveedores/nuevo" element={<ProveedorFormPage />} />
              <Route path="proveedores/:id/editar" element={<ProveedorFormPage />} />
              <Route path="ordenes" element={<OrdenListPage />} />
              <Route path="ordenes/nueva" element={<OrdenCreatePage />} />
              <Route path="ordenes/:id" element={<OrdenDetailPage />} />
              <Route path="ordenes/:id/editar" element={<OrdenEditInitiatedPage />} />
              <Route path="ordenes/:id/recepcionar" element={<RecepcionFormPage />} />
              <Route path="vendedor" element={<VendedorHomePage />} />
              <Route path="jornadas" element={<JornadaListPage />} />
              <Route path="jornadas/nueva" element={<JornadaOpenPage />} />
              <Route path="jornadas/:id" element={<JornadaDetailPage />} />
              <Route path="jornadas/:id/apertura" element={<TrasladoAperturaPage />} />
              <Route path="jornadas/:id/apertura/confirmar" element={<TrasladoConfirmPage />} />
              <Route path="jornadas/:id/cierre/conteo" element={<CierreConteoPage />} />
              <Route path="jornadas/:id/cierre/dinero" element={<CierreDineroPage />} />
              <Route path="jornadas/:id/cierre/resumen" element={<CierreResumenPage />} />
              <Route path="reposicion" element={<ReposicionPage />} />
              <Route path="stock" element={<StockPage />} />
              <Route path="reabastecimiento" element={<ReabastecimientoPage />} />
              <Route path="ajustes" element={<AjusteListPage />} />
              <Route path="ajustes/nuevo" element={<AjusteFormPage />} />
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </main>
        </div>
        {!isAdmin && <TiendaBottomTabBar />}
      </ModuleLayout>
    </div>
  );
}
