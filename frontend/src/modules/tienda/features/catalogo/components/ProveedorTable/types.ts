import type { Supplier } from "../../types";

export interface ProveedorTableProps {
  proveedores: Supplier[];
  isLoading: boolean;
  isAdmin: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}
