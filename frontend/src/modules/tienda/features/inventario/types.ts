// ---------------------------------------------------------------------------
// Domain types — Inventario feature
// All API response shapes are in camelCase (axios interceptor transforms from snake_case)
//
// Backend field mapping (snake_case → camelCase):
//   current_quantity → currentQuantity
//   updated_at → updatedAt
//   product_id → productId
//   stock_total → stockTotal
//   current_qty → currentQty
//   reorder_point → reorderPoint
//   suggested_order_qty → suggestedOrderQty
//   units_in_active_orders → unitsInActiveOrders
//   units_in_reception → unitsInReception
//   net_quantity_to_order → netQuantityToOrder
//   movement_type → movementType
//   unit_cost → unitCost
//   recorded_by → recordedBy
// ---------------------------------------------------------------------------
import type { Product } from "@modules/tienda/features/catalogo/types";

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export interface LocationStock {
  id: string;
  product: Product;
  location: string;
  currentQuantity: string;
  updatedAt: string;
}

export interface StockTotal {
  productId: string;
  name: string;
  stockTotal: string;
  breakdown: LocationStock[];
}

export interface ReplenishmentItem {
  product: Product;
  currentQty: string;
  reorderPoint: number;
  suggestedOrderQty: number;
  unitsInActiveOrders: number;
  unitsInReception: number;
  netQuantityToOrder: number;
}

export type MovementType = "IN" | "OUT";

export interface InventoryMovement {
  id: string;
  product: Product;
  location: string;
  movementType: MovementType;
  quantity: number;
  unitCost: string;
  concept: string;
  note: string;
  recordedBy: string;
  timestamp: string;
}

export interface InventoryMovementPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryMovement[];
}

// ---------------------------------------------------------------------------
// Query param types
// ---------------------------------------------------------------------------

export interface StockQueryParams {
  productoId?: string;
  ubicacionId?: string;
}

export interface StockTotalQueryParams {
  productoId: string;
}

export interface AjustesQueryParams {
  productId?: string;
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Mutation payload types
// ---------------------------------------------------------------------------

export interface CreateAjusteInput {
  product: string;
  location: string;
  movementType: MovementType;
  quantity: number;
  unitCost: string;
  note: string;
}

export interface FromReplenishmentInput {
  productIds: string[];
}

// ---------------------------------------------------------------------------
// Form value types
// ---------------------------------------------------------------------------

export interface AjusteFormValues {
  product: string;
  location: string;
  movementType: MovementType;
  quantity: number;
  unitCost: string;
  note: string;
}
