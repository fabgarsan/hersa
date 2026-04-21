import { AppBar, IconButton, Toolbar, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

import { useAuth } from "@modules/auth";

interface AppHeaderProps {
  drawerWidth: number;
  onMenuClick: () => void;
}

export function AppHeader({ drawerWidth, onMenuClick }: AppHeaderProps) {
  const { logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: "primary.main",
        borderBottom: "1px solid",
        borderColor: "primary.light",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          aria-label="abrir navegación"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Toolbar sx={{ flexGrow: 1, p: 0 }} disableGutters />

        <Tooltip title="Cerrar sesión">
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
