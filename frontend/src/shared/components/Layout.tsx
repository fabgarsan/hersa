import { useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";

import { AppHeader } from "./AppHeader";
import { NavSidebar } from "./NavSidebar";
import styles from "./Layout.module.scss";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box className={styles.root}>
      <AppHeader onMenuClick={handleDrawerToggle} />

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className={styles.mobileDrawer}
      >
        <NavSidebar />
      </Drawer>

      <Drawer variant="permanent" className={styles.desktopDrawer} open>
        <NavSidebar />
      </Drawer>

      <Box component="main" className={styles.main}>
        <Toolbar />
        <Box className={styles.content}>{children}</Box>
      </Box>
    </Box>
  );
}
