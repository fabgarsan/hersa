import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EventIcon from "@mui/icons-material/Event";
import BusinessIcon from "@mui/icons-material/Business";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { NavLink } from "react-router-dom";

import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import type { TiendaNavItem, TiendaSidebarProps } from "./types";
import styles from "./TiendaSidebar.module.scss";

const NAV_ITEMS: (TiendaNavItem & { icon: React.ReactNode })[] = [
  { label: "Inventario", path: TIENDA_ROUTES.STOCK, icon: <InventoryIcon /> },
  { label: "Catálogo", path: TIENDA_ROUTES.PRODUCTOS, icon: <CategoryIcon /> },
  { label: "Proveedores", path: TIENDA_ROUTES.PROVEEDORES, icon: <BusinessIcon /> },
  { label: "Compras", path: TIENDA_ROUTES.ORDENES, icon: <ShoppingCartIcon /> },
  { label: "Jornadas", path: TIENDA_ROUTES.JORNADAS, icon: <EventIcon /> },
];

function DrawerContent() {
  return (
    <>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" className={styles.brandTitle}>
          TIENDA HERSA
        </Typography>
      </Toolbar>
      <Divider />
      <List className={styles.list}>
        {NAV_ITEMS.map(({ label, path, icon }) => (
          <NavLink key={path} to={path} className={styles.navLink}>
            {({ isActive }) => (
              <ListItemButton className={isActive ? styles.navItemActive : styles.navItem}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      className: isActive ? styles.navLabelActive : styles.navLabel,
                    },
                  }}
                />
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>
    </>
  );
}

export function TiendaSidebar({ mobileOpen = false, onMobileClose }: TiendaSidebarProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  if (isMdUp) {
    return (
      <Drawer variant="permanent" className={styles.drawer} open>
        <DrawerContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      className={styles.drawer}
      ModalProps={{ keepMounted: true }}
    >
      <DrawerContent />
    </Drawer>
  );
}
