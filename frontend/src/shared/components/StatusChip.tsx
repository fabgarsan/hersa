import Chip from "@mui/material/Chip";

import type { StatusChipProps } from "./types";
import styles from "./StatusChip.module.scss";

export function StatusChip({ status, statusMap, size = "small" }: StatusChipProps) {
  const config = statusMap[status];

  if (!config) {
    return (
      <Chip label={status} size={size} color="default" variant="filled" className={styles.chip} />
    );
  }

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="filled"
      className={styles.chip}
    />
  );
}
