import type { SyntheticEvent } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EventIcon from "@mui/icons-material/Event";
import { useLocation, useNavigate } from "react-router-dom";

import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import type { TiendaTabBarProps, TiendaTabItem } from "./types";
import styles from "./TiendaTabBar.module.scss";

const TAB_ITEMS: TiendaTabItem[] = [
  { label: "Inventario", path: TIENDA_ROUTES.STOCK, icon: <InventoryIcon /> },
  { label: "Catálogo", path: TIENDA_ROUTES.PRODUCTOS, icon: <CategoryIcon /> },
  { label: "Proveedores", path: TIENDA_ROUTES.PROVEEDORES, icon: <BusinessIcon /> },
  { label: "Compras", path: TIENDA_ROUTES.ORDENES, icon: <ShoppingCartIcon /> },
  { label: "Jornadas", path: TIENDA_ROUTES.JORNADAS, icon: <EventIcon /> },
];

function resolveActiveTab(pathname: string): string | false {
  const match = TAB_ITEMS.find((item) => pathname.startsWith(item.path));
  return match ? match.path : false;
}

export function TiendaTabBar(_props: TiendaTabBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = resolveActiveTab(location.pathname);

  function handleChange(_event: SyntheticEvent, newValue: string) {
    navigate(newValue);
  }

  return (
    <div className={styles.root}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons={false}
      >
        {TAB_ITEMS.map(({ label, path, icon }) => (
          <Tab
            key={path}
            value={path}
            label={label}
            icon={icon}
            iconPosition="start"
            className={styles.tab}
          />
        ))}
      </Tabs>
    </div>
  );
}
