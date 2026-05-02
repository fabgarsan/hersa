import type { ReactNode } from "react";
import type { GridColDef, GridSortItem } from "@mui/x-data-grid";

// Extended column — field constrained to the row's own keys.
// We use a type alias (intersection) because GridColDef uses generics internally,
// and TypeScript does not allow interfaces to extend generic utility types directly.
export type DataTableColumn<R> = Omit<GridColDef, "field"> & {
  field: keyof R & string;
};

// Contract that DataTable consumes; implemented by any adapter
export interface DataTableAdapter<R> {
  rows: R[];
  totalCount: number;
  page: number; // 0-based (DataGrid convention)
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  sortModel: GridSortItem[];
  searchValue: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (model: GridSortItem[]) => void;
  onSearchChange: (value: string) => void;
}

// Main component props
export interface DataTableProps<R extends { id: string | number }> {
  /** Used to persist column config in localStorage */
  tableId: string;
  columns: DataTableColumn<R>[];
  adapter: DataTableAdapter<R>;
  /** default: "client" */
  sortingMode?: "client" | "server";
  /** default: "client" */
  searchMode?: "client" | "server";
  /** If provided, enables expandable rows */
  getRowDetail?: (row: R) => ReactNode;
  /** Slot for custom actions (e.g. "+ Nuevo") */
  toolbarActions?: ReactNode;
  /** default: tableId */
  exportFilename?: string;
  /** default: [10, 25, 50] */
  pageSizeOptions?: number[];
  /** Habilita selección de filas con checkbox. default: false */
  selectable?: boolean;
  /**
   * Slot de acciones bulk. Se muestra solo cuando hay selección activa.
   * Recibe los IDs seleccionados y el flag allServerSelected.
   * Cuando allServerSelected=true, selectedIds será un array vacío — el módulo
   * debe usar el flag para saber que la selección abarca todo el servidor.
   */
  selectionActions?: (selectedIds: (string | number)[], allServerSelected: boolean) => ReactNode;
}

// Toolbar props
export interface DataTableToolbarProps {
  tableId: string;
  totalCount: number;
  page: number;
  pageSize: number;
  searchValue: string;
  searchMode: "client" | "server";
  onSearchChange: (value: string) => void;
  columns: GridColDef[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (model: Record<string, boolean>) => void;
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
  toolbarActions?: ReactNode;
  exportFilename: string;
  rows: unknown[];
  visibleColumns: GridColDef[];
  // Selection props
  selectable: boolean;
  selectedCount: number;
  allServerSelected: boolean;
  /** totalCount already present — reused for the "Seleccionar N filas" button */
  onSelectAllServer: () => void;
  onClearSelection: () => void;
  /** True when the header checkbox is fully checked (all page rows selected) */
  showSelectAllServerButton: boolean;
  selectedIds: (string | number)[];
}
