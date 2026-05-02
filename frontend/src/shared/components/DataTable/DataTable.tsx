import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams, GridSortModel } from "@mui/x-data-grid";

import { EmptyState } from "@shared/components/EmptyState";
import { ErrorState } from "@shared/components/ErrorState";
import { LoadingState } from "@shared/components/LoadingState";

import { DataTableToolbar } from "./DataTableToolbar";
import type { DataTableColumn, DataTableProps } from "./types";
import styles from "./DataTable.module.scss";

// Storage key for persisted column config
function storageKey(tableId: string) {
  return `datatable-cols-${tableId}`;
}

interface PersistedColConfig {
  visibility: Record<string, boolean>;
  order: string[];
}

function loadPersistedConfig(tableId: string): PersistedColConfig | null {
  try {
    const raw = localStorage.getItem(storageKey(tableId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedColConfig;
  } catch {
    return null;
  }
}

function savePersistedConfig(tableId: string, config: PersistedColConfig) {
  try {
    localStorage.setItem(storageKey(tableId), JSON.stringify(config));
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota)
  }
}

/**
 * Client-side row filter: matches rows where at least one field
 * (converted to string) contains the search term (case-insensitive).
 */
function filterRowsClientSide<R extends Record<string, unknown>>(rows: R[], search: string): R[] {
  const term = search.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) =>
    Object.values(row).some((val) => val != null && String(val).toLowerCase().includes(term)),
  );
}

// Sentinel type for detail rows inserted alongside real rows
interface DetailRow {
  id: string;
  __isDetailRow: true;
  __parentId: string | number;
  __content: ReactNode;
}

type AugmentedRow<R> = R | DetailRow;

function isDetailRow(row: unknown): row is DetailRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "__isDetailRow" in row &&
    (row as DetailRow).__isDetailRow === true
  );
}

export function DataTable<R extends { id: string | number }>({
  tableId,
  columns,
  adapter,
  sortingMode = "client",
  searchMode = "client",
  getRowDetail,
  toolbarActions,
  exportFilename,
  pageSizeOptions = [10, 25, 50],
}: DataTableProps<R>) {
  // --- Persistent column config ---
  const fieldNames = useMemo(() => columns.map((c) => c.field), [columns]);

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const persisted = loadPersistedConfig(tableId);
    return persisted?.visibility ?? {};
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const persisted = loadPersistedConfig(tableId);
    if (persisted?.order && persisted.order.length > 0) return persisted.order;
    return fieldNames;
  });

  // Sync columnOrder when columns prop changes (new fields added)
  useEffect(() => {
    setColumnOrder((prev) => {
      const existing = new Set(prev);
      const additions = fieldNames.filter((f) => !existing.has(f));
      if (additions.length === 0) return prev;
      return [...prev, ...additions];
    });
  }, [fieldNames]);

  // Persist whenever visibility or order changes
  useEffect(() => {
    savePersistedConfig(tableId, { visibility: columnVisibility, order: columnOrder });
  }, [tableId, columnVisibility, columnOrder]);

  // --- Expandable rows state ---
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  const toggleRow = useCallback((id: string | number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // --- Rows: client filtering + expansion ---
  const filteredRows = useMemo<R[]>(() => {
    if (searchMode !== "client" || !adapter.searchValue) return adapter.rows;
    return filterRowsClientSide(
      adapter.rows as unknown as Record<string, unknown>[],
      adapter.searchValue,
    ) as R[];
  }, [adapter.rows, adapter.searchValue, searchMode]);

  const augmentedRows = useMemo<AugmentedRow<R>[]>(() => {
    if (!getRowDetail) return filteredRows;
    const result: AugmentedRow<R>[] = [];
    for (const row of filteredRows) {
      result.push(row);
      if (expandedRows.has(row.id)) {
        const detailRow: DetailRow = {
          id: `${row.id}-detail`,
          __isDetailRow: true,
          __parentId: row.id,
          __content: getRowDetail(row),
        };
        result.push(detailRow);
      }
    }
    return result;
  }, [filteredRows, expandedRows, getRowDetail]);

  // --- Column construction ---
  const expandColumn: GridColDef = useMemo(
    () => ({
      field: "__expand__",
      headerName: "",
      width: 48,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => {
        if (isDetailRow(params.row)) return null;
        const rowId = (params.row as R).id;
        const expanded = expandedRows.has(rowId);
        return (
          <IconButton
            size="small"
            onClick={() => toggleRow(rowId)}
            aria-label={expanded ? "Contraer fila" : "Expandir fila"}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        );
      },
    }),
    [expandedRows, toggleRow],
  );

  // Build ordered columns according to user-configured order
  const orderedColumns = useMemo<GridColDef[]>(() => {
    const colMap = new Map<string, DataTableColumn<R>>(columns.map((c) => [c.field, c]));
    const ordered: GridColDef[] = columnOrder
      .filter((f) => colMap.has(f))
      .map((f) => colMap.get(f) as GridColDef);

    if (getRowDetail) {
      return [expandColumn, ...ordered];
    }
    return ordered;
  }, [columns, columnOrder, getRowDetail, expandColumn]);

  // Columns currently visible — used for export
  const visibleColumns = useMemo<GridColDef[]>(
    () => orderedColumns.filter((c) => columnVisibility[c.field] !== false),
    [orderedColumns, columnVisibility],
  );

  // Detail rows span all columns — override renderCell
  const gridColumns = useMemo<GridColDef[]>(() => {
    if (!getRowDetail) return orderedColumns;
    return orderedColumns.map((col, colIdx) => ({
      ...col,
      renderCell: (params: GridRenderCellParams) => {
        if (isDetailRow(params.row)) {
          // Only render detail content in the first visible column
          if (colIdx === 0) {
            return <Box className={styles.detailCell}>{(params.row as DetailRow).__content}</Box>;
          }
          return null;
        }
        return col.renderCell ? col.renderCell(params) : params.value;
      },
    }));
  }, [orderedColumns, getRowDetail]);

  // --- Sort handling ---
  // GridSortModel is readonly; spread into a mutable array to satisfy DataTableAdapter contract
  const handleSortChange = useCallback(
    (model: GridSortModel) => {
      adapter.onSortChange([...model]);
    },
    [adapter],
  );

  // --- Column visibility model for DataGrid ---
  // Detail rows should not block any column
  const dataGridVisibilityModel = useMemo<Record<string, boolean>>(
    () => ({ ...columnVisibility }),
    [columnVisibility],
  );

  // --- Overlay slots ---
  const NoRowsOverlay = useCallback(() => {
    const variant = adapter.searchValue ? "filtered" : "initial";
    return <EmptyState variant={variant} />;
  }, [adapter.searchValue]);

  const LoadingOverlay = useCallback(() => <LoadingState variant="skeleton" />, []);

  // Rows to export: only non-detail rows currently displayed
  const exportableRows = useMemo(
    () => filteredRows as unknown as Record<string, unknown>[],
    [filteredRows],
  );

  const resolvedExportFilename = exportFilename ?? tableId;

  return (
    <Box className={styles.root}>
      <DataTableToolbar
        tableId={tableId}
        totalCount={adapter.totalCount}
        page={adapter.page}
        pageSize={adapter.pageSize}
        searchValue={adapter.searchValue}
        searchMode={searchMode}
        onSearchChange={adapter.onSearchChange}
        columns={columns}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        toolbarActions={toolbarActions}
        exportFilename={resolvedExportFilename}
        rows={exportableRows}
        visibleColumns={visibleColumns}
      />

      {adapter.error && (
        <Box className={styles.errorBanner}>
          <ErrorState description={adapter.error.message} />
        </Box>
      )}

      <Box className={styles.gridWrapper}>
        <DataGrid
          rows={augmentedRows as { id: string | number }[]}
          columns={gridColumns}
          // Pagination
          paginationMode="server"
          rowCount={adapter.totalCount}
          paginationModel={{ page: adapter.page, pageSize: adapter.pageSize }}
          onPaginationModelChange={(model) => {
            if (model.page !== adapter.page) adapter.onPageChange(model.page);
            if (model.pageSize !== adapter.pageSize) adapter.onPageSizeChange(model.pageSize);
          }}
          pageSizeOptions={pageSizeOptions}
          // Sorting
          sortingMode={sortingMode}
          sortModel={adapter.sortModel}
          onSortModelChange={handleSortChange}
          // Column management
          columnVisibilityModel={dataGridVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibility}
          // Loading
          loading={adapter.isLoading}
          // Overlays
          slots={{
            noRowsOverlay: NoRowsOverlay,
            loadingOverlay: LoadingOverlay,
          }}
          // Detail rows: prevent selection and highlight
          getRowClassName={(params) => (isDetailRow(params.row) ? styles.detailRow : "")}
          isRowSelectable={(params) => !isDetailRow(params.row)}
          // Accessibility
          aria-label={tableId}
          className={styles.dataGrid}
        />
      </Box>
    </Box>
  );
}
