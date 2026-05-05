import Chip from "@mui/material/Chip";

import type { StatusChipTiendaConfig, StatusChipTiendaProps } from "./types";
import styles from "./StatusChipTienda.module.scss";

const STATUS_MAP: Record<string, StatusChipTiendaConfig> = {
  // SalesDay (Jornada)
  open: { label: "Abierta", color: "info" },
  closed: { label: "Cerrada", color: "success" },
  // PurchaseOrder (Orden de compra)
  initiated: { label: "Iniciada", color: "warning" },
  pending: { label: "Pendiente", color: "info" },
  partial: { label: "Parcial", color: "warning" },
};

export function StatusChipTienda({ status, size = "small" }: StatusChipTiendaProps) {
  const config: StatusChipTiendaConfig = STATUS_MAP[status] ?? {
    label: "Desconocido",
    color: "default",
  };

  return <Chip label={config.label} color={config.color} size={size} className={styles.root} />;
}
