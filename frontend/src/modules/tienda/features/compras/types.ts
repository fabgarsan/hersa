// ---------------------------------------------------------------------------
// Domain types — Compras feature (Purchase Orders)
// All API response shapes are in camelCase (axios interceptor transforms from snake_case)
//
// Backend field mapping (snake_case → camelCase):
//   supplier → supplier (UUID FK for admin; string name for vendedor)
//   order_date → orderDate
//   order_lines → orderLines
//   ordered_quantity → orderedQuantity
//   received_quantity_cumulative → receivedQuantityCumulative
//   expected_unit_cost → expectedUnitCost
//   created_at → createdAt
//   closing_justification → closingJustification
//   created_by → createdBy
//   line_id → lineId  (in 422 discrepancy response)
//   product_id → productId
//   ordered_quantity → orderedQuantity
//   received_quantity → receivedQuantity
//   delta_pct → deltaPct
//   justificacion_requerida → justificacionRequerida
// ---------------------------------------------------------------------------
import type { Control, UseFormReturn } from "react-hook-form";

// PurchaseOrder.Status values (match backend TextChoices)
export type OrdenEstado = "initiated" | "pending" | "partially_received" | "closed";
// OrderLine.Status values (match backend TextChoices)
export type OrdenLineaEstado = "pending" | "partially_received" | "complete";

export interface OrdenLinea {
  id: string;
  /** UUID of the product (FK) */
  product: string;
  orderedQuantity: number | null;
  receivedQuantityCumulative: number;
  /** Decimal string — admin only; undefined for vendedor */
  expectedUnitCost?: string | null;
  status: OrdenLineaEstado;
}

export interface Orden {
  id: string;
  status: OrdenEstado;
  /** UUID string for admin; supplier name string for vendedor */
  supplier: string | null;
  orderDate: string | null;
  notes: string;
  closingJustification?: string;
  createdBy?: string;
  createdAt: string;
  orderLines: OrdenLinea[];
}

export interface DiscrepanciaItem {
  lineId: string;
  productId: string;
  orderedQuantity: number;
  receivedQuantity: number;
  delta: number;
  deltaPct: number;
}

export interface CerrarOrden422Response {
  discrepancias: DiscrepanciaItem[];
  umbral: number;
  justificacionRequerida: boolean;
}

// ---------------------------------------------------------------------------
// Query param types
// ---------------------------------------------------------------------------

export interface OrdenesQueryParams {
  estado?: string;
  proveedorId?: string;
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Mutation payload types
// ---------------------------------------------------------------------------

export interface OrdenLineaInput {
  product: string;
  orderedQuantity: number;
  expectedUnitCost: string;
}

export interface CreateOrdenInput {
  supplier: string | null;
  notes: string;
  orderLines: OrdenLineaInput[];
}

export interface UpdateOrdenInput {
  id: string;
  payload: Partial<CreateOrdenInput>;
}

export interface RecepcionDestino {
  ubicacionId: string;
  cantidad: number;
}

export interface RecepcionarInput {
  ordenId: string;
  orderLine: string;
  receivedQuantityGood: number;
  damagedQuantity: number;
  realUnitCost: string;
  destinations: RecepcionDestino[];
}

export interface CerrarOrdenInput {
  id: string;
  closingJustification?: string | null;
}

// ---------------------------------------------------------------------------
// Form value types
// ---------------------------------------------------------------------------

export interface OrdenFormValues {
  supplier: string;
  notes: string;
  orderLines: OrdenLineaFormRow[];
}

export interface OrdenLineaFormRow {
  product: string;
  orderedQuantity: string;
  expectedUnitCost: string;
}

export interface RecepcionFormValues {
  orderLine: string;
  receivedQuantityGood: string;
  damagedQuantity: string;
  realUnitCost: string;
  ubicacionId: string;
  cantidad: string;
}

export interface OrdenCloseFormValues {
  closingJustification: string;
}

// ---------------------------------------------------------------------------
// Paginated response
// ---------------------------------------------------------------------------

export interface OrdenesPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Orden[];
}

// ---------------------------------------------------------------------------
// Component prop types
// ---------------------------------------------------------------------------

export interface OrdenStatusChipProps {
  status: OrdenEstado | OrdenLineaEstado | string;
  size?: "small" | "medium";
}

export interface OrdenCloseDialogProps {
  open: boolean;
  discrepancias: DiscrepanciaItem[];
  umbral: number;
  ordenId: string;
  onClose: () => void;
}

export interface RecepcionRowProps {
  linea: OrdenLinea;
  productoNombre: string;
}

// ---------------------------------------------------------------------------
// Hook return types
// ---------------------------------------------------------------------------

export interface UseOrdenFormReturn {
  control: Control<OrdenFormValues>;
  handleSubmit: UseFormReturn<OrdenFormValues>["handleSubmit"];
  isSubmitting: boolean;
  isEditMode: boolean;
  orden: Orden | undefined;
  isLoadingOrden: boolean;
  errorOrden: Error | null;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error";
  onCloseSnackbar: () => void;
  onSubmit: (values: OrdenFormValues) => void;
  appendLinea: () => void;
  removeLinea: (index: number) => void;
}

export interface UseRecepcionFormReturn {
  control: Control<RecepcionFormValues>;
  handleSubmit: UseFormReturn<RecepcionFormValues>["handleSubmit"];
  isSubmitting: boolean;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error";
  onCloseSnackbar: () => void;
  onSubmit: (values: RecepcionFormValues) => void;
}
