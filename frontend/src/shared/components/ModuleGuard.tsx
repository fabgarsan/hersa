import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { usePermissions } from "@shared/hooks/usePermissions";
import { LoadingState } from "@shared/components/LoadingState";
import type { ModuleGuardProps } from "./types";
import styles from "./ModuleGuard.module.scss";

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { hasAccess, isLoading } = usePermissions();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasAccess(module)) {
    return (
      <Box className={styles.accessDenied}>
        <LockOutlinedIcon className={styles.accessDeniedIcon} />
        <Typography variant="h6" className={styles.accessDeniedTitle}>
          No tienes acceso a esta sección
        </Typography>
        <Typography variant="body2" className={styles.accessDeniedMessage}>
          Contacta al administrador si necesitas acceso.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
