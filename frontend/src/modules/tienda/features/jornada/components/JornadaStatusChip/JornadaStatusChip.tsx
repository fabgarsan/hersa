import Chip from "@mui/material/Chip";

import type { JornadaStatusChipConfig, JornadaStatusChipProps } from "./types";
import styles from "./JornadaStatusChip.module.scss";

const STATUS_MAP: Record<string, JornadaStatusChipConfig> = {
  open: { label: "Abierta", color: "info" },
  closed: { label: "Cerrada", color: "success" },
};

export function JornadaStatusChip({ status, size = "small" }: JornadaStatusChipProps) {
  const config: JornadaStatusChipConfig = STATUS_MAP[status] ?? {
    label: "Desconocido",
    color: "default",
  };

  return <Chip label={config.label} color={config.color} size={size} className={styles.root} />;
}
