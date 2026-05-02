import { useCallback, useState } from "react";

import type { UseExpandableRowsReturn } from "./types";

/**
 * Manages expanded/collapsed state for DataTable detail rows.
 * Only used when the DataTable receives the `getRowDetail` prop.
 */
export function useExpandableRows(): UseExpandableRowsReturn {
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

  return { expandedRows, toggleRow };
}
