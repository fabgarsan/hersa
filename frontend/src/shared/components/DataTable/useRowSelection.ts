import { useCallback, useMemo, useState } from "react";

import type { GridRowSelectionModel } from "@mui/x-data-grid";

import type { UseRowSelectionReturn } from "./types";

interface UseRowSelectionOptions {
  selectable: boolean;
  totalCount: number;
  currentPageRealIds: (string | number)[];
}

/**
 * Manages multi-level row selection for DataTable.
 * Supports per-page selection, "select all on server" mode, and clear.
 */
export function useRowSelection({
  selectable,
  totalCount,
  currentPageRealIds,
}: UseRowSelectionOptions): UseRowSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [allServerSelected, setAllServerSelected] = useState(false);

  // rowSelectionModel: IDs on the current page that belong to selectedIds.
  // When allServerSelected, show all current-page rows as selected.
  const rowSelectionModel = useMemo<GridRowSelectionModel>(() => {
    if (allServerSelected) return currentPageRealIds;
    return currentPageRealIds.filter((id) => selectedIds.has(id));
  }, [allServerSelected, currentPageRealIds, selectedIds]);

  // Header checkbox is fully checked when every page row is selected.
  // Show the "select all server" prompt only when that condition holds.
  const showSelectAllServerButton = useMemo<boolean>(() => {
    if (!selectable || currentPageRealIds.length === 0) return false;
    return currentPageRealIds.every((id) => selectedIds.has(id));
  }, [selectable, currentPageRealIds, selectedIds]);

  const selectedCount = allServerSelected ? totalCount : selectedIds.size;

  const handleRowSelectionModelChange = useCallback(
    (model: GridRowSelectionModel) => {
      const modelSet = new Set(model as (string | number)[]);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        // Remove all current-page IDs then re-add the ones now selected
        for (const id of currentPageRealIds) {
          if (modelSet.has(id)) {
            next.add(id);
          } else {
            next.delete(id);
          }
        }
        return next;
      });
      // If user deselects any row while allServerSelected, drop the flag
      if (allServerSelected) {
        setAllServerSelected(false);
      }
    },
    [currentPageRealIds, allServerSelected],
  );

  const handleSelectAllServer = useCallback(() => {
    setAllServerSelected(true);
    setSelectedIds(new Set());
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setAllServerSelected(false);
  }, []);

  return {
    selectedIds,
    allServerSelected,
    rowSelectionModel,
    showSelectAllServerButton,
    selectedCount,
    handleRowSelectionModelChange,
    handleSelectAllServer,
    handleClearSelection,
  };
}
