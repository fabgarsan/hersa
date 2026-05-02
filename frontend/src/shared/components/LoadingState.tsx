import { useId } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";

import type { LoadingStateProps } from "./types";
import styles from "./LoadingState.module.scss";

export function LoadingState({
  variant = "spinner",
  rows = 3,
  label = "Cargando...",
}: LoadingStateProps) {
  const baseId = useId();

  if (variant === "skeleton") {
    return (
      <Box className={styles.skeletonRoot}>
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={`${baseId}-${i}`} variant="rectangular" className={styles.skeletonRow} />
        ))}
      </Box>
    );
  }

  return (
    <Box className={styles.spinnerRoot}>
      <CircularProgress aria-label={label} />
    </Box>
  );
}
