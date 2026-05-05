import Chip from "@mui/material/Chip";

import type { OrdenStatusChipConfig, OrdenStatusChipProps } from "./types";
import styles from "./OrdenStatusChip.module.scss";

// PurchaseOrder.Status: initiated | pending | partially_received | closed
// OrderLine.Status:     pending | partially_received | complete
const STATUS_MAP: Record<string, OrdenStatusChipConfig> = {
  initiated: { label: "Iniciada", color: "warning" },
  pending: { label: "Pendiente", color: "info" },
  partially_received: { label: "Parcial", color: "warning" },
  closed: { label: "Cerrada", color: "success" },
  complete: { label: "Completa", color: "success" },
};

export function OrdenStatusChip({ status, size = "small" }: OrdenStatusChipProps) {
  const config: OrdenStatusChipConfig = STATUS_MAP[status] ?? {
    label: status,
    color: "default",
  };

  return <Chip label={config.label} color={config.color} size={size} className={styles.root} />;
}
