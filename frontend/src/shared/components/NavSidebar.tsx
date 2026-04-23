import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "@shared/constants/routes";
import { UI } from "@shared/constants/ui";
import { usePermissions } from "@shared/hooks/usePermissions";
import type { NavItem } from "./types";
import styles from "./NavSidebar.module.scss";

const NAV_ITEMS: NavItem[] = [
  { label: UI.nav.STORE, icon: <StorefrontIcon />, path: ROUTES.TIENDA, module: "tienda" },
  { label: UI.nav.GRADUATIONS, icon: <SchoolIcon />, path: ROUTES.GRADOS, module: "programador" },
  { label: UI.nav.ADMIN, icon: <AdminPanelSettingsIcon />, path: ROUTES.ADMIN, module: null },
  { label: UI.nav.PROFILE, icon: <PersonIcon />, path: ROUTES.PROFILE, module: null },
];

export function NavSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAccess } = usePermissions();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const visibleItems = NAV_ITEMS.filter((item) => item.module === null || hasAccess(item.module));

  return (
    <Box className={styles.root}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" fontWeight={700} color="secondary.main" letterSpacing={1}>
          HERSA
        </Typography>
      </Toolbar>

      <Divider className={styles.divider} />

      <List className={styles.list}>
        {visibleItems.map(({ label, icon, path }) => {
          const active = isActive(path);
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              className={active ? styles.navItemActive : styles.navItem}
            >
              <ListItemIcon className={styles.navItemIcon}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize: "0.9rem" }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
