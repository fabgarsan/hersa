import { useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import RepeatIcon from "@mui/icons-material/Repeat";
import LogoutIcon from "@mui/icons-material/Logout";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useNavigate, useLocation } from "react-router-dom";

import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import styles from "./TiendaBottomTabBar.module.scss";

const TAB_ITEMS = [
  { label: "Apertura", path: TIENDA_ROUTES.JORNADAS_NUEVA, icon: <OpenInBrowserIcon /> },
  { label: "Reposición", path: TIENDA_ROUTES.REABASTECIMIENTO, icon: <RepeatIcon /> },
  { label: "Cierre", path: TIENDA_ROUTES.VENDEDOR, icon: <LogoutIcon /> },
  { label: "Stock", path: TIENDA_ROUTES.STOCK, icon: <InventoryIcon /> },
];

export function TiendaBottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = TAB_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));
  const [value, setValue] = useState(currentIndex >= 0 ? currentIndex : 0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(TAB_ITEMS[newValue].path);
  };

  return (
    <Paper className={styles.root} elevation={0}>
      <BottomNavigation value={value} onChange={handleChange}>
        {TAB_ITEMS.map(({ label, path, icon }) => (
          <BottomNavigationAction key={path} label={label} icon={icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
