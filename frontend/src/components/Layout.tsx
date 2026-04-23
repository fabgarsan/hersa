import type { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/features/auth/useAuth";
import styles from "./Layout.module.scss";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();

  return (
    <Box minHeight="100vh" bgcolor="grey.50">
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" fontWeight={700} className={styles.titleSpacer}>
            Hersa
          </Typography>
          <Tooltip title="Sign out">
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className={styles.pageContent}>
        {children}
      </Container>
    </Box>
  );
}
