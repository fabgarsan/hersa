import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { DetailDrawerProps } from "./types";
import styles from "./DetailDrawer.module.scss";

export function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  width = 480,
}: DetailDrawerProps) {
  const drawerWidth = typeof width === "number" ? `${width}px` : width;

  return (
    <Drawer
      anchor="right"
      variant="temporary"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { style: { width: drawerWidth } } }}
    >
      <Stack className={styles.root}>
        <Stack className={styles.header}>
          <Stack className={styles.headerText}>
            <Typography variant="h6">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" className={styles.subtitle}>
                {subtitle}
              </Typography>
            )}
          </Stack>
          <IconButton onClick={onClose} className={styles.closeButton} size="small" aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Stack className={styles.content}>{children}</Stack>
        {actions && <Stack className={styles.footer}>{actions}</Stack>}
      </Stack>
    </Drawer>
  );
}
