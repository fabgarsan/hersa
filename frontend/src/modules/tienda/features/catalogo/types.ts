// ---------------------------------------------------------------------------
// Domain types — Catalogo feature
// All API response shapes are in camelCase (axios interceptor transforms from snake_case)
// Backend field mapping: name→name, description→description, sale_price→salePrice,
// avg_cost→avgCost, is_active→isActive, contact→contact
// ---------------------------------------------------------------------------
import type { Control, UseFormReturn } from "react-hook-form";

export interface SupplierBrief {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitLabel: string;
  salePrice: string;
  avgCost: string;
  reorderPoint: number;
  suggestedOrderQty: number;
  isActive: boolean;
  createdAt: string;
  suppliers?: SupplierBrief[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Paginated response shapes (DRF standard)
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Query param types
// ---------------------------------------------------------------------------

export interface ProductosQueryParams {
  q?: string;
  activo?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ProveedoresQueryParams {
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Form value types
// ---------------------------------------------------------------------------

export interface ProductoFormValues {
  name: string;
  description: string;
  salePrice: string;
  isActive: boolean;
}

export interface ProveedorFormValues {
  name: string;
  contact: string;
}

// ---------------------------------------------------------------------------
// Mutation payload types
// ---------------------------------------------------------------------------

export interface AssociateSupplierPayload {
  supplierId: string;
}

export interface UpdateProductoInput {
  id: string;
  payload: Partial<ProductoFormValues>;
}

export interface UpdateProveedorInput {
  id: string;
  payload: Partial<ProveedorFormValues>;
}

export interface AssociateProveedorInput {
  productoId: string;
  supplierId: string;
}

export interface RemoveProveedorInput {
  productoId: string;
  supplierId: string;
}

// ---------------------------------------------------------------------------
// Component prop types
// ---------------------------------------------------------------------------

export interface ProveedorPanelProps {
  productoId: string;
  suppliers: SupplierBrief[];
  isAdmin: boolean;
}

// ---------------------------------------------------------------------------
// Hook return types
// ---------------------------------------------------------------------------

export interface UseProductoFormReturn {
  control: Control<ProductoFormValues>;
  handleSubmit: UseFormReturn<ProductoFormValues>["handleSubmit"];
  isSubmitting: boolean;
  isEditMode: boolean;
  producto: Product | undefined;
  isLoadingProducto: boolean;
  errorProducto: Error | null;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error";
  onCloseSnackbar: () => void;
  onSubmit: (values: ProductoFormValues) => void;
}

export interface UseProveedorFormReturn {
  control: Control<ProveedorFormValues>;
  handleSubmit: UseFormReturn<ProveedorFormValues>["handleSubmit"];
  isSubmitting: boolean;
  isEditMode: boolean;
  proveedor: Supplier | undefined;
  isLoadingProveedor: boolean;
  errorProveedor: Error | null;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: "success" | "error";
  onCloseSnackbar: () => void;
  onSubmit: (values: ProveedorFormValues) => void;
}
