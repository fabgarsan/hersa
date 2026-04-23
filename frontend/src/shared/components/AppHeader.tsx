import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

import { useAuth } from "@modules/auth";
import styles from "./AppHeader.module.scss";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { logout } = useAuth();

  return (
    <AppBar position="fixed" elevation={0} className={styles.appBar}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          aria-label="abrir navegación"
          onClick={onMenuClick}
          className={styles.menuButton}
        >
          <MenuIcon />
        </IconButton>

        <Toolbar className={styles.spacer} disableGutters />

        <Tooltip title="Cerrar sesión">
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
