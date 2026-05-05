// Pages
export { default as ProductoListPage } from "./pages/ProductoListPage";
export { default as ProductoFormPage } from "./pages/ProductoFormPage";
export { default as ProductoDetailPage } from "./pages/ProductoDetailPage";
export { default as ProveedorListPage } from "./pages/ProveedorListPage";
export { default as ProveedorFormPage } from "./pages/ProveedorFormPage";

// Components
export { ProductoTable } from "./components/ProductoTable";
export { ProveedorTable } from "./components/ProveedorTable";
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
  ProductoTableProps,
  ProveedorTableProps,
  ProveedorPanelProps,
} from "./types";
