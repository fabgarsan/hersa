import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useExpandableRows } from "./useExpandableRows";
import { useRowSelection } from "./useRowSelection";
import { useColumnPersistence } from "./useColumnPersistence";
import type { DataTableColumn } from "./types";

vi.mock("@modules/auth", () => ({
  useMeQuery: () => ({ data: { id: 42 } }),
}));

describe("useExpandableRows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with no expanded rows", () => {
    const { result } = renderHook(() => useExpandableRows());

    expect(result.current.expandedRows.size).toBe(0);
  });

  it("should expand a row when toggleRow is called", () => {
    const { result } = renderHook(() => useExpandableRows());

    act(() => {
      result.current.toggleRow("row-1");
    });

    expect(result.current.expandedRows.has("row-1")).toBe(true);
    expect(result.current.expandedRows.size).toBe(1);
  });

  it("should collapse a row when toggleRow is called again", () => {
    const { result } = renderHook(() => useExpandableRows());

    act(() => {
      result.current.toggleRow("row-1");
    });

    expect(result.current.expandedRows.has("row-1")).toBe(true);

    act(() => {
      result.current.toggleRow("row-1");
    });

    expect(result.current.expandedRows.has("row-1")).toBe(false);
    expect(result.current.expandedRows.size).toBe(0);
  });

  it("should handle multiple expanded rows", () => {
    const { result } = renderHook(() => useExpandableRows());

    act(() => {
      result.current.toggleRow("row-1");
      result.current.toggleRow("row-2");
      result.current.toggleRow("row-3");
    });

    expect(result.current.expandedRows.has("row-1")).toBe(true);
    expect(result.current.expandedRows.has("row-2")).toBe(true);
    expect(result.current.expandedRows.has("row-3")).toBe(true);
    expect(result.current.expandedRows.size).toBe(3);
  });

  it("should support numeric row IDs", () => {
    const { result } = renderHook(() => useExpandableRows());

    act(() => {
      result.current.toggleRow(1);
      result.current.toggleRow(2);
    });

    expect(result.current.expandedRows.has(1)).toBe(true);
    expect(result.current.expandedRows.has(2)).toBe(true);
  });
});

describe("useRowSelection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with empty selectedIds", () => {
    const { result } = renderHook(() =>
      useRowSelection({ selectable: true, totalCount: 10, currentPageRealIds: [] }),
    );

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.allServerSelected).toBe(false);
  });

  it("should add IDs to selectedIds when handleRowSelectionModelChange is called", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 10,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2"]);
    });

    expect(result.current.selectedIds.has("1")).toBe(true);
    expect(result.current.selectedIds.has("2")).toBe(true);
    expect(result.current.selectedIds.has("3")).toBe(false);
  });

  it("should remove IDs from selectedIds when deselected", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 10,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2", "3"]);
    });

    expect(result.current.selectedIds.size).toBe(3);

    act(() => {
      result.current.handleRowSelectionModelChange(["1"]);
    });

    expect(result.current.selectedIds.has("1")).toBe(true);
    expect(result.current.selectedIds.has("2")).toBe(false);
    expect(result.current.selectedIds.has("3")).toBe(false);
  });

  it("should set showSelectAllServerButton=true when all page IDs are selected", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2", "3"]);
    });

    expect(result.current.showSelectAllServerButton).toBe(true);
  });

  it("should set showSelectAllServerButton=false when not all page IDs are selected", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2"]);
    });

    expect(result.current.showSelectAllServerButton).toBe(false);
  });

  it("should set allServerSelected=true when handleSelectAllServer is called", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleSelectAllServer();
    });

    expect(result.current.allServerSelected).toBe(true);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it("should clear selectedIds when handleSelectAllServer is called", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2"]);
    });

    expect(result.current.selectedIds.size).toBe(2);

    act(() => {
      result.current.handleSelectAllServer();
    });

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.allServerSelected).toBe(true);
  });

  it("should reset both selectedIds and allServerSelected when handleClearSelection is called", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleSelectAllServer();
    });

    expect(result.current.allServerSelected).toBe(true);

    act(() => {
      result.current.handleClearSelection();
    });

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.allServerSelected).toBe(false);
  });

  it("should return selectedCount equal to totalCount when allServerSelected=true", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 150,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleSelectAllServer();
    });

    expect(result.current.selectedCount).toBe(150);
  });

  it("should return selectedCount equal to selectedIds.size when allServerSelected=false", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 150,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2"]);
    });

    expect(result.current.selectedCount).toBe(2);
  });

  it("should clear allServerSelected when a row is deselected after selecting all", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleSelectAllServer();
    });

    expect(result.current.allServerSelected).toBe(true);

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2"]);
    });

    expect(result.current.allServerSelected).toBe(false);
  });

  it("should include currentPageRealIds in rowSelectionModel when allServerSelected=true", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleSelectAllServer();
    });

    expect(result.current.rowSelectionModel).toEqual(["1", "2", "3"]);
  });

  it("should support numeric IDs", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: [1, 2, 3],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange([1, 2]);
    });

    expect(result.current.selectedIds.has(1)).toBe(true);
    expect(result.current.selectedIds.has(2)).toBe(true);
  });

  it("should return showSelectAllServerButton=false when selectable=false", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: false,
        totalCount: 100,
        currentPageRealIds: ["1", "2", "3"],
      }),
    );

    act(() => {
      result.current.handleRowSelectionModelChange(["1", "2", "3"]);
    });

    expect(result.current.showSelectAllServerButton).toBe(false);
  });

  it("should return showSelectAllServerButton=false when currentPageRealIds is empty", () => {
    const { result } = renderHook(() =>
      useRowSelection({
        selectable: true,
        totalCount: 100,
        currentPageRealIds: [],
      }),
    );

    expect(result.current.showSelectAllServerButton).toBe(false);
  });
});

describe("useColumnPersistence", () => {
  interface TestRow {
    id: string;
    name: string;
    email: string;
  }

  const mockColumns: DataTableColumn<TestRow>[] = [
    { field: "name", headerName: "Name" },
    { field: "email", headerName: "Email" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should initialize columnOrder with column fields on first render", () => {
    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    expect(result.current.columnOrder).toEqual(["name", "email"]);
  });

  it("should initialize columnVisibility as empty object", () => {
    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    expect(result.current.columnVisibility).toEqual({});
  });

  it("should update columnVisibility when setColumnVisibility is called", () => {
    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    act(() => {
      result.current.setColumnVisibility({ name: false, email: true });
    });

    expect(result.current.columnVisibility).toEqual({ name: false, email: true });
  });

  it("should persist columnVisibility to localStorage when it changes", () => {
    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    act(() => {
      result.current.setColumnVisibility({ name: false });
    });

    const stored = localStorage.getItem("hersa:datatable-cols:42:test-table");
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.visibility).toEqual({ name: false });
    }
  });

  it("should persist columnOrder to localStorage when it changes", () => {
    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    act(() => {
      result.current.setColumnOrder(["email", "name"]);
    });

    const stored = localStorage.getItem("hersa:datatable-cols:42:test-table");
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.order).toEqual(["email", "name"]);
    }
  });

  it("should load persisted columnOrder from localStorage", () => {
    localStorage.setItem(
      "hersa:datatable-cols:anon:test-table",
      JSON.stringify({
        visibility: {},
        order: ["email", "name"],
      }),
    );

    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    expect(result.current.columnOrder).toEqual(["email", "name"]);
  });

  it("should load persisted columnVisibility from localStorage", () => {
    localStorage.setItem(
      "hersa:datatable-cols:anon:test-table",
      JSON.stringify({
        visibility: { name: false },
        order: ["name", "email"],
      }),
    );

    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    expect(result.current.columnVisibility).toEqual({ name: false });
  });

  it("should append new columns to columnOrder when columns prop changes", () => {
    const { result, rerender } = renderHook(
      ({ columns }) => useColumnPersistence("test-table", columns),
      { initialProps: { columns: mockColumns } },
    );

    expect(result.current.columnOrder).toEqual(["name", "email"]);

    const newColumns: DataTableColumn<TestRow>[] = [
      ...mockColumns,
      { field: "id", headerName: "ID" },
    ];

    rerender({ columns: newColumns });

    expect(result.current.columnOrder).toEqual(["name", "email", "id"]);
  });

  it("should not duplicate existing columns when new ones are added", () => {
    const { result, rerender } = renderHook(
      ({ columns }) => useColumnPersistence("test-table", columns),
      { initialProps: { columns: mockColumns } },
    );

    const newColumns: DataTableColumn<TestRow>[] = [
      ...mockColumns,
      { field: "id", headerName: "ID" },
    ];

    rerender({ columns: newColumns });
    rerender({ columns: newColumns });

    expect(result.current.columnOrder).toEqual(["name", "email", "id"]);
  });

  it("should use user-scoped localStorage key when userId is available", () => {
    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    act(() => {
      result.current.setColumnVisibility({ name: false });
    });

    const stored = localStorage.getItem("hersa:datatable-cols:42:test-table");
    expect(stored).toBeTruthy();
  });

  it("should handle invalid localStorage data gracefully", () => {
    localStorage.setItem("hersa:datatable-cols:anon:test-table", "invalid-json");

    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    expect(result.current.columnOrder).toEqual(["name", "email"]);
    expect(result.current.columnVisibility).toEqual({});
  });

  it("should update columnOrder by calling setColumnOrder", () => {
    const { result } = renderHook(() => useColumnPersistence("test-table", mockColumns));

    act(() => {
      result.current.setColumnOrder(["email", "name"]);
    });

    expect(result.current.columnOrder).toEqual(["email", "name"]);
  });
});
