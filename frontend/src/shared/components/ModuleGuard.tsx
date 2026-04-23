import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { usePermissions } from "@shared/hooks/usePermissions";
import type { ModuleGuardProps } from "./types";
import styles from "./ModuleGuard.module.scss";

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { hasAccess, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (!hasAccess(module)) {
    return (
      <Box className={styles.notFound}>
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
