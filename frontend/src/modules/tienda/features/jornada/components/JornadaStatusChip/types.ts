import type { JornadaEstado } from "../../types";

export interface JornadaStatusChipProps {
  status: JornadaEstado;
  size?: "small" | "medium";
}

export interface JornadaStatusChipConfig {
  label: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}
