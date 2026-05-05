import type { OrdenEstado, OrdenLineaEstado } from "../../types";

export interface OrdenStatusChipProps {
  status: OrdenEstado | OrdenLineaEstado | (string & {});
  size?: "small" | "medium";
}

export interface OrdenStatusChipConfig {
  label: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}
