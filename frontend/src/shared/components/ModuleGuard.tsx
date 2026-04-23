import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { usePermissions } from "@shared/hooks/usePermissions";
import { ModuleSlug } from "@shared/types/permissions";

interface ModuleGuardProps {
  module: ModuleSlug;
  children: React.ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { hasAccess, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (!hasAccess(module)) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h2" color="text.secondary">
          404
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Esta página no existe.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
