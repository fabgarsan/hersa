import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useLocation, useNavigate } from "react-router-dom";

import { useMeQuery } from "@modules/auth";
import { ROUTES } from "@shared/constants/routes";
import { UI } from "@shared/constants/ui";
import { usePermissions } from "@shared/hooks/usePermissions";
import type { NavItem } from "./types";
import styles from "./NavSidebar.module.scss";

const NAV_ITEMS: NavItem[] = [
  {
    label: UI.nav.STORE,
    icon: <StorefrontIcon />,
    path: ROUTES.TIENDA,
    module: "modules.access_tienda",
  },
  {
    label: UI.nav.GRADUATIONS,
    icon: <SchoolIcon />,
    path: ROUTES.GRADOS,
    module: "modules.access_programador",
  },
  { label: UI.nav.ADMIN, icon: <AdminPanelSettingsIcon />, path: ROUTES.ADMIN, module: "modules.access_admin" },
  { label: UI.nav.PROFILE, icon: <PersonIcon />, path: ROUTES.PROFILE, module: null },
];

export function NavSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAccess } = usePermissions();
  const { data: user } = useMeQuery();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const visibleItems = NAV_ITEMS.filter((item) => item.module === null || hasAccess(item.module));

  return (
    <Box className={styles.root}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" className={styles.brandTitle}>
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
                slotProps={{
                  primary: { className: active ? styles.navItemLabelActive : styles.navItemLabel },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider className={styles.divider} />

      <Box className={styles.userSection}>
        <PersonIcon className={styles.userIcon} />
        <Typography variant="caption" className={styles.username} noWrap>
          {user?.username ?? "—"}
        </Typography>
      </Box>
    </Box>
  );
}
