import type { Product } from "../../types";

export interface ProductoTableProps {
  productos: Product[];
  isLoading: boolean;
  isAdmin: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}
