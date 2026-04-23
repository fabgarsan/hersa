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
import { ModuleSlug } from "@shared/types/permissions";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  module: ModuleSlug | null;
}

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

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.module === null || hasAccess(item.module),
  );

  return (
    <Box sx={{ bgcolor: "primary.dark", height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar sx={{ bgcolor: "primary.main", flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={700} color="secondary.main" letterSpacing={1}>
          HERSA
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: "primary.light" }} />

      <List sx={{ pt: 1, px: 1, flexGrow: 1 }}>
        {visibleItems.map(({ label, icon, path }) => {
          const active = isActive(path);
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                pl: 1.5,
                color: active ? "secondary.main" : "rgba(255,255,255,0.75)",
                bgcolor: active ? "rgba(201,162,39,0.10)" : "transparent",
                borderLeft: "3px solid",
                borderColor: active ? "secondary.main" : "transparent",
                "&:hover": {
                  bgcolor: active ? "rgba(201,162,39,0.15)" : "primary.light",
                  color: active ? "secondary.main" : "white",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{icon}</ListItemIcon>
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
