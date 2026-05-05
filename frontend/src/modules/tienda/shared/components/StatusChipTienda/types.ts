export type StatusChipTiendaColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export interface StatusChipTiendaProps {
  status: string;
  size?: "small" | "medium";
}

export interface StatusChipTiendaConfig {
  label: string;
  color: StatusChipTiendaColor;
}
