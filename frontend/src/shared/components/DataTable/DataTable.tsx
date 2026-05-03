import { useCallback, useMemo } from "react";
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
import type { DataTableColumn, DataTableProps, DetailRow } from "./types";
import { useColumnPersistence } from "./useColumnPersistence";
import { useExpandableRows } from "./useExpandableRows";
import { useRowSelection } from "./useRowSelection";
import styles from "./DataTable.module.scss";

type AugmentedRow<R> = R | DetailRow;

function isDetailRow(row: unknown): row is DetailRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "__isDetailRow" in row &&
    (row as DetailRow).__isDetailRow
  );
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
  selectable = false,
  selectionActions,
}: DataTableProps<R>) {
  // --- Persistent column config (includes user-scoped localStorage key) ---
  const { columnVisibility, columnOrder, setColumnVisibility, setColumnOrder } =
    useColumnPersistence(tableId, columns);

  // --- Expandable rows ---
  const { expandedRows, toggleRow } = useExpandableRows();

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

  // IDs of the current page that are real rows (not detail rows)
  const currentPageRealIds = useMemo<(string | number)[]>(
    () => augmentedRows.filter((r) => !isDetailRow(r)).map((r) => (r as R).id),
    [augmentedRows],
  );

  // --- Row selection ---
  const {
    selectedIds,
    allServerSelected,
    rowSelectionModel,
    showSelectAllServerButton,
    selectedCount,
    handleRowSelectionModelChange,
    handleSelectAllServer,
    handleClearSelection,
  } = useRowSelection({ selectable, totalCount: adapter.totalCount, currentPageRealIds });

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
    if (getRowDetail) return [expandColumn, ...ordered];
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
      renderCell: (params: GridRenderCellParams): ReactNode => {
        if (isDetailRow(params.row)) {
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
  const handleSortChange = useCallback(
    (model: GridSortModel) => {
      adapter.onSortChange([...model]);
    },
    [adapter],
  );

  // --- Column visibility model for DataGrid ---
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
        selectable={selectable}
        selectedCount={selectedCount}
        allServerSelected={allServerSelected}
        onSelectAllServer={handleSelectAllServer}
        onClearSelection={handleClearSelection}
        showSelectAllServerButton={showSelectAllServerButton}
        selectedIds={allServerSelected ? [] : Array.from(selectedIds)}
      />

      {adapter.error && (
        <Box className={styles.errorBanner}>
          <ErrorState description={adapter.error.message} />
        </Box>
      )}

      {selectable && (selectedIds.size > 0 || allServerSelected) && selectionActions && (
        <Box className={styles.selectionBar}>
          {selectionActions(allServerSelected ? [] : Array.from(selectedIds), allServerSelected)}
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
          // Selection
          checkboxSelection={selectable}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          keepNonExistentRowsSelected
          // Accessibility
          aria-label={tableId}
          className={styles.dataGrid}
        />
      </Box>
    </Box>
  );
}
