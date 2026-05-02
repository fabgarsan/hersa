import type { ReactNode } from "react";

import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { ComingSoonStateProps } from "./types";
import styles from "./ComingSoonState.module.scss";

const DEFAULT_TITLE = "En desarrollo";
const DEFAULT_DESCRIPTION = "Esta sección estará disponible próximamente.";

export function ComingSoonState({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  icon,
}: ComingSoonStateProps) {
  const resolvedIcon: ReactNode = icon ?? <BuildIcon className={styles.icon} />;

  return (
    <Box className={styles.root}>
      <Box className={styles.iconWrapper}>{resolvedIcon}</Box>
      <Typography variant="h6" className={styles.title}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" className={styles.description}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
