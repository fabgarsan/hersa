import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import type { ErrorStateProps } from "./types";
import styles from "./ErrorState.module.scss";

export function ErrorState({
  title = "Algo salió mal",
  description = "Ocurrió un error inesperado. Intentá de nuevo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Box className={styles.root}>
      <Box className={styles.iconWrapper}>
        <ErrorOutlineIcon className={styles.icon} />
      </Box>
      <Typography variant="h6" className={styles.title}>
        {title}
      </Typography>
      <Typography variant="body2" className={styles.description}>
        {description}
      </Typography>
      {onRetry && (
        <Box className={styles.action}>
          <Button variant="outlined" color="error" onClick={onRetry}>
            Reintentar
          </Button>
        </Box>
      )}
    </Box>
  );
}
