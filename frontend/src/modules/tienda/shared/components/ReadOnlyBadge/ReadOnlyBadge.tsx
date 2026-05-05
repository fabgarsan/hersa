import Chip from "@mui/material/Chip";

import type { ReadOnlyBadgeProps } from "./types";
import styles from "./ReadOnlyBadge.module.scss";

export function ReadOnlyBadge({ label, value }: ReadOnlyBadgeProps) {
  return <Chip label={`${label}: ${value}`} variant="outlined" disabled className={styles.root} />;
}
