import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { ModuleLayoutProps } from "./types";
import styles from "./ModuleLayout.module.scss";

export function ModuleLayout({ title, subtitle, actions, footer, children }: ModuleLayoutProps) {
  return (
    <Box className={styles.root}>
      <Box className={styles.header}>
        <Box className={styles.headerText}>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box className={styles.actions}>{actions}</Box>}
      </Box>

      <Box>{children}</Box>

      {footer && <Box className={styles.footer}>{footer}</Box>}
    </Box>
  );
}
