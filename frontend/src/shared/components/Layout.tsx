import { useState } from "react";
import type React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";

import { AppHeader } from "./AppHeader";
import { NavSidebar } from "./NavSidebar";
import { useConnectivityIndicatorHeight } from "./ConnectivityIndicator";
import type { LayoutProps } from "./types";
import styles from "./Layout.module.scss";

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const indicatorHeight = useConnectivityIndicatorHeight();
  const mainStyle =
    indicatorHeight > 0
      ? ({ "--indicator-offset": `${indicatorHeight}px` } as React.CSSProperties)
      : undefined;

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

      {/*
       * indicatorHeight compensates for the ConnectivityIndicator fixed bar when it
       * is visible, preventing the bar from overlapping the main content area.
       * Transitions synchronised with the bar's 250ms fade-out via CSS on the indicator.
       */}
      <Box component="main" className={styles.main} style={mainStyle}>
        <Toolbar />
        <Box className={styles.content}>{children}</Box>
      </Box>
    </Box>
  );
}
