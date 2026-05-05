// ---------------------------------------------------------------------------
// Domain types — Jornada feature (Sales Day)
// All API response shapes are in camelCase (axios interceptor transforms from snake_case)
//
// Backend field mapping (snake_case → camelCase):
//   location       → location (UUID FK)
//   seller         → seller (UUID FK / string)
//   status         → status ("open" | "closed")
//   closed_by      → closedBy
//   closed_at      → closedAt
//   cash_delivery  → cashDelivery
//   cash_out_amount      → cashOutAmount
//   cash_out_description → cashOutDescription
//   cash_alert     → cashAlert
//   revenue_total  → revenueTotal
//   created_at     → createdAt
//   date           → date
// ---------------------------------------------------------------------------

import type { Control } from "react-hook-form";
import type { Product } from "@modules/tienda/features/catalogo/types";

// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export type JornadaEstado = "open" | "closed";

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

export interface Jornada {
  id: string;
  date: string;
  location: string;
  seller: string;
  status: JornadaEstado;
  closedBy: string | null;
  closedAt: string | null;
  // admin-only cash fields (undefined for vendedor)
  cashDelivery?: string | null;
  cashOutAmount?: string | null;
  cashOutDescription?: string;
  cashAlert?: string | null;
  revenueTotal?: string | null;
  createdAt: string;
}

export interface CloseSummaryItem {
  product: {
    id: string;
    name: string;
    unitLabel: string;
    // admin-only
    salePrice?: string;
    avgCost?: string;
  };
  transferredUnits: number;
  currentPosStock: string;
  impliedSoldUnits: string;
  proposedReturnQty: string;
  // admin-only
  snapshotAvgCost?: string;
  estimatedRevenue?: string;
  estimatedCogs?: string;
}

// ---------------------------------------------------------------------------
// Cierre draft (localStorage state)
// ---------------------------------------------------------------------------

export interface ConteoItem {
  productoId: string;
  productoNombre: string;
  stockInicial: number;
  cantidadContada: number;
}

export interface DineroItem {
  denominacion: number;
  cantidad: number;
}

export interface CierreDraft {
  conteos: ConteoItem[];
  billetes: DineroItem[];
  totalEfectivoDeclarado: string;
}

// ---------------------------------------------------------------------------
// Mutation input types
// ---------------------------------------------------------------------------

export interface CreateJornadaInput {
  location: string;
  date: string;
}

export interface TrasladoAperturaInput {
  jornadaId: string;
  items: Array<{ product: string; quantity: number }>;
}

export interface ReposicionInput {
  jornadaId: string;
  items: Array<{ product: string; quantity: number }>;
}

export interface ResumenCierreInput {
  jornadaId: string;
  items: Array<{ product: string; finalCount: number }>;
  cashDelivery: string;
  cashOutAmount?: string | null;
  cashOutDescription?: string;
}

export interface CerrarJornadaInput {
  jornadaId: string;
  items: Array<{ product: string; finalCount: number }>;
  cashDelivery: string;
  cashOutAmount?: string | null;
  cashOutDescription?: string;
}

// ---------------------------------------------------------------------------
// Query param types
// ---------------------------------------------------------------------------

export interface JornadasQueryParams {
  page?: number;
  pageSize?: number;
}

export interface JornadasPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Jornada[];
}

// ---------------------------------------------------------------------------
// Form value types
// ---------------------------------------------------------------------------

export interface JornadaOpenFormValues {
  location: string;
  date: string;
}

export interface TrasladoAperturaRow {
  product: string;
  quantity: string;
}

export interface TrasladoAperturaFormValues {
  items: TrasladoAperturaRow[];
}

export interface ReposicionFormValues {
  product: string;
  quantity: string;
}

export interface ConteoRow {
  productoId: string;
  productoNombre: string;
  stockInicial: number;
  cantidadContada: string;
}

export interface ConteoFormValues {
  conteos: ConteoRow[];
}

export interface DineroRow {
  denominacion: number;
  cantidad: string;
}

export interface DineroFormValues {
  billetes: DineroRow[];
}

// ---------------------------------------------------------------------------
// Router state types
// ---------------------------------------------------------------------------

export interface LocationState {
  items?: TrasladoAperturaRow[];
  productos?: Product[];
}

// ---------------------------------------------------------------------------
// Component prop types
// ---------------------------------------------------------------------------

export interface JornadaStatusChipProps {
  status: JornadaEstado;
  size?: "small" | "medium";
}

export interface JornadaStatusChipConfig {
  label: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

export interface AlertaCajaAlertProps {
  cashAlert: string | null | undefined;
}

export interface CierreProgressBarProps {
  step: 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// Hook return types
// ---------------------------------------------------------------------------

export interface UseCierreDraftReturn {
  draft: CierreDraft | null;
  saveDraft: (draft: CierreDraft) => void;
  clearDraft: () => void;
}

export interface UseJornadaActionsReturn {
  jornada: Jornada | null | undefined;
  isLoadingJornada: boolean;
  isTrasladando: boolean;
  isReponiendo: boolean;
  isCerrando: boolean;
  handleTraslado: (input: TrasladoAperturaInput) => void;
  handleReposicion: (input: ReposicionInput) => void;
  handleCerrar: (input: CerrarJornadaInput) => void;
}

export interface UseTrasladoFormReturn {
  control: Control<TrasladoAperturaFormValues>;
  isSubmitting: boolean;
  appendItem: () => void;
  removeItem: (index: number) => void;
  onSubmit: (values: TrasladoAperturaFormValues) => void;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error";
  onCloseSnackbar: () => void;
}
