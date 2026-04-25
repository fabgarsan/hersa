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
      <Box className={styles.accessDenied}>
        <Typography variant="h4" className={styles.accessDeniedTitle}>
          Acceso restringido
        </Typography>
        <Typography variant="body1" className={styles.accessDeniedMessage}>
          No tienes permiso para acceder a este módulo.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
