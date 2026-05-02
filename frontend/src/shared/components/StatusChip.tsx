import Chip from "@mui/material/Chip";

import type { StatusChipProps } from "./types";

export function StatusChip({ status, statusMap, size = "small" }: StatusChipProps) {
  const config = statusMap[status];

  if (!config) {
    return <Chip label={status} size={size} color="default" variant="filled" />;
  }

  return (
    <Chip label={config.label} color={config.color} size={size} variant="filled" />
  );
}
