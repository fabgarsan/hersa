import type { DiscrepanciaItem } from "../../types";

export interface OrdenCloseDialogProps {
  open: boolean;
  discrepancias: DiscrepanciaItem[];
  umbral: number;
  ordenId: string;
  onClose: () => void;
  onSuccess: () => void;
}
