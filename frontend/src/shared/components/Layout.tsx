import { useState } from "react";
import type { ReactNode } from "react";
import { Box, Drawer, Toolbar } from "@mui/material";

import { AppHeader } from "./AppHeader";
import { NavSidebar } from "./NavSidebar";

const DRAWER_WIDTH = 240;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppHeader drawerWidth={DRAWER_WIDTH} onMenuClick={handleDrawerToggle} />

      {/* Mobile: temporary drawer (overlay) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", border: "none" },
        }}
      >
        <NavSidebar />
      </Drawer>

      {/* Desktop: permanent drawer (pushes content) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", border: "none" },
        }}
        open
      >
        <NavSidebar />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
