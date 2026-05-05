// Pages
export { default as ProductoListPage } from "./pages/ProductoListPage";
export { default as ProductoFormPage } from "./pages/ProductoFormPage";
export { default as ProductoDetailPage } from "./pages/ProductoDetailPage";
export { default as ProveedorListPage } from "./pages/ProveedorListPage";
export { default as ProveedorFormPage } from "./pages/ProveedorFormPage";

// Components
export { ProveedorPanel } from "./components/ProveedorPanel";

// Types
export type {
  Product,
  Supplier,
  SupplierBrief,
  PaginatedResponse,
  ProductosQueryParams,
  ProveedoresQueryParams,
  ProductoFormValues,
  ProveedorFormValues,
  ProveedorPanelProps,
} from "./types";
