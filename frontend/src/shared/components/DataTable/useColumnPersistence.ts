import { useEffect, useMemo, useState } from "react";

import { useMeQuery } from "@modules/auth";

import type { DataTableColumn, UseColumnPersistenceReturn } from "./types";

interface PersistedColConfig {
  visibility: Record<string, boolean>;
  order: string[];
}

// Include userId in the key so each user gets isolated column preferences.
// Falls back to "anon" when the user data is not yet loaded.
function storageKey(tableId: string, userId: string | number | undefined): string {
  return `hersa:datatable-cols:${userId ?? "anon"}:${tableId}`;
}

function loadPersistedConfig(key: string): PersistedColConfig | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedColConfig;
  } catch {
    return null;
  }
}

function savePersistedConfig(key: string, config: PersistedColConfig) {
  try {
    localStorage.setItem(key, JSON.stringify(config));
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota)
  }
}

/**
 * Manages column visibility and column order for DataTable, persisted to
 * localStorage under a user-scoped key to isolate preferences per account.
 */
export function useColumnPersistence<R>(
  tableId: string,
  columns: DataTableColumn<R>[],
): UseColumnPersistenceReturn {
  const { data: me } = useMeQuery();
  const userId = me?.id;

  const key = useMemo(() => storageKey(tableId, userId), [tableId, userId]);

  const fieldNames = useMemo(() => columns.map((c) => c.field), [columns]);

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const persisted = loadPersistedConfig(storageKey(tableId, undefined));
    return persisted?.visibility ?? {};
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const persisted = loadPersistedConfig(storageKey(tableId, undefined));
    if (persisted?.order && persisted.order.length > 0) return persisted.order;
    return fieldNames;
  });

  // Once userId resolves, reload from the user-scoped key
  useEffect(() => {
    if (userId === undefined) return;
    const persisted = loadPersistedConfig(key);
    if (!persisted) return;
    setColumnVisibility(persisted.visibility);
    if (persisted.order.length > 0) setColumnOrder(persisted.order);
  }, [key, userId]);

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
    savePersistedConfig(key, { visibility: columnVisibility, order: columnOrder });
  }, [key, columnVisibility, columnOrder]);

  return { columnVisibility, columnOrder, setColumnVisibility, setColumnOrder };
}
