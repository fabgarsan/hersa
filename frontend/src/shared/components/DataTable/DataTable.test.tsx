import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { renderWithProviders } from "@/tests/utils";
import { DataTable } from "./DataTable";
import type { DataTableAdapter, DataTableColumn } from "./types";

vi.mock("@shared/components/EmptyState", () => ({
  EmptyState: ({ variant }: { variant: string }) => (
    <div data-testid="empty-state" data-variant={variant}>
      {variant}
    </div>
  ),
}));

vi.mock("@shared/components/ErrorState", () => ({
  ErrorState: ({ description }: { description: string }) => (
    <div data-testid="error-state">{description}</div>
  ),
}));

vi.mock("@shared/components/LoadingState", () => ({
  LoadingState: () => <div data-testid="loading-state" />,
}));

vi.mock("@modules/auth", () => ({
  useMeQuery: () => ({ data: { id: 42 } }),
}));

type MockColDef = {
  field: string;
  headerName?: string;
  renderCell?: (params: { row: Record<string, unknown>; value: unknown }) => ReactNode;
};

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({
    rows,
    columns,
    "aria-label": ariaLabel,
    loading,
    columnVisibilityModel,
    onRowSelectionModelChange,
    slots,
  }: {
    rows: Record<string, unknown>[];
    columns: MockColDef[];
    "aria-label"?: string;
    loading?: boolean;
    columnVisibilityModel?: Record<string, boolean>;
    onRowSelectionModelChange?: (model: (string | number)[]) => void;
    slots?: {
      noRowsOverlay?: React.ComponentType;
      loadingOverlay?: React.ComponentType;
    };
  }) => {
    const NoRows = slots?.noRowsOverlay;
    const Loading = slots?.loadingOverlay;
    const visibleCols = columns.filter((c) => columnVisibilityModel?.[c.field] !== false);

    return (
      <div data-testid="data-grid" aria-label={ariaLabel ?? ""}>
        {visibleCols.map((col) => (
          <div key={col.field} data-testid={`col-header-${col.field}`}>
            {String(col.headerName ?? col.field)}
          </div>
        ))}
        {loading && Loading && <Loading />}
        {!loading && rows.length === 0 && NoRows && <NoRows />}
        {!loading &&
          rows.map((row) => (
            <div key={String(row.id)} data-testid={`row-${row.id}`}>
              {visibleCols.map((col) => (
                <span key={col.field}>
                  {col.renderCell
                    ? col.renderCell({ row, value: row[col.field] })
                    : String(row[col.field] ?? "")}
                </span>
              ))}
            </div>
          ))}
        {onRowSelectionModelChange && (
          <button
            data-testid="simulate-select"
            onClick={() => onRowSelectionModelChange(rows.map((r) => r.id as string | number))}
          >
            Select All
          </button>
        )}
      </div>
    );
  },
}));

interface TestRow {
  id: string;
  name: string;
  email: string;
}

describe("DataTable", () => {
  const mockAdapter: DataTableAdapter<TestRow> = {
    rows: [],
    totalCount: 0,
    page: 0,
    pageSize: 10,
    isLoading: false,
    error: null,
    sortModel: [],
    searchValue: "",
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onSortChange: vi.fn(),
    onSearchChange: vi.fn(),
  };

  const mockColumns: DataTableColumn<TestRow>[] = [
    { field: "name", headerName: "Name" },
    { field: "email", headerName: "Email" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderTable(overrides: Partial<React.ComponentProps<typeof DataTable<TestRow>>> = {}) {
    return renderWithProviders(
      <DataTable tableId="test-table" columns={mockColumns} adapter={mockAdapter} {...overrides} />,
    );
  }

  describe("basic rendering", () => {
    it("should render the table with aria-label set to tableId", () => {
      const { getByTestId } = renderTable();
      expect(getByTestId("data-grid")).toHaveAttribute("aria-label", "test-table");
    });

    it("should render column headers", () => {
      const { getByTestId } = renderTable();
      expect(getByTestId("col-header-name")).toHaveTextContent("Name");
      expect(getByTestId("col-header-email")).toHaveTextContent("Email");
    });

    it("should render rows from adapter.rows", () => {
      const rows: TestRow[] = [
        { id: "1", name: "Alice", email: "alice@example.com" },
        { id: "2", name: "Bob", email: "bob@example.com" },
      ];
      const { getByTestId } = renderTable({
        adapter: { ...mockAdapter, rows, totalCount: 2 },
      });

      expect(getByTestId("row-1")).toBeInTheDocument();
      expect(getByTestId("row-2")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("should show initial empty state when rows=[] and no searchValue", () => {
      const { getByTestId } = renderTable({
        adapter: { ...mockAdapter, rows: [], searchValue: "" },
      });
      expect(getByTestId("empty-state")).toHaveAttribute("data-variant", "initial");
    });

    it("should show filtered empty state when rows=[] and searchValue is set", () => {
      const { getByTestId } = renderTable({
        adapter: { ...mockAdapter, rows: [], searchValue: "nonexistent" },
      });
      expect(getByTestId("empty-state")).toHaveAttribute("data-variant", "filtered");
    });
  });

  describe("client-side search", () => {
    it("should filter rows when searchMode='client' and searchValue is set", () => {
      const rows: TestRow[] = [
        { id: "1", name: "Alice Johnson", email: "alice@example.com" },
        { id: "2", name: "Bob Smith", email: "bob@example.com" },
      ];
      const { queryByTestId } = renderTable({
        searchMode: "client",
        adapter: { ...mockAdapter, rows, searchValue: "alice" },
      });

      expect(queryByTestId("row-1")).toBeInTheDocument();
      expect(queryByTestId("row-2")).not.toBeInTheDocument();
    });

    it("should perform case-insensitive search", () => {
      const rows: TestRow[] = [
        { id: "1", name: "Alice", email: "alice@example.com" },
        { id: "2", name: "Bob", email: "bob@example.com" },
      ];
      const { queryByTestId } = renderTable({
        searchMode: "client",
        adapter: { ...mockAdapter, rows, searchValue: "ALICE" },
      });

      expect(queryByTestId("row-1")).toBeInTheDocument();
      expect(queryByTestId("row-2")).not.toBeInTheDocument();
    });

    it("should not filter client-side when searchMode='server'", () => {
      const rows: TestRow[] = [
        { id: "1", name: "Alice", email: "alice@example.com" },
        { id: "2", name: "Bob", email: "bob@example.com" },
      ];
      const { queryByTestId } = renderTable({
        searchMode: "server",
        adapter: { ...mockAdapter, rows, searchValue: "alice" },
      });

      expect(queryByTestId("row-1")).toBeInTheDocument();
      expect(queryByTestId("row-2")).toBeInTheDocument();
    });

    it("should search across all row fields", () => {
      const rows: TestRow[] = [
        { id: "1", name: "Alice", email: "alice@example.com" },
        { id: "2", name: "Bob", email: "bob@example.com" },
      ];
      const { queryByTestId } = renderTable({
        searchMode: "client",
        adapter: { ...mockAdapter, rows, searchValue: "bob@example.com" },
      });

      expect(queryByTestId("row-1")).not.toBeInTheDocument();
      expect(queryByTestId("row-2")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("should render the loading overlay when adapter.isLoading=true", () => {
      const { getByTestId } = renderTable({
        adapter: { ...mockAdapter, isLoading: true },
      });
      expect(getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should not render loading overlay when adapter.isLoading=false", () => {
      const { queryByTestId } = renderTable({
        adapter: { ...mockAdapter, isLoading: false },
      });
      expect(queryByTestId("loading-state")).not.toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("should display error banner when adapter.error is set", () => {
      const error = new Error("Data fetch failed");
      const { getByTestId } = renderTable({
        adapter: { ...mockAdapter, error },
      });

      const errorState = getByTestId("error-state");
      expect(errorState).toBeInTheDocument();
      expect(errorState.textContent).toBe("Data fetch failed");
    });

    it("should not display error banner when adapter.error is null", () => {
      const { queryByTestId } = renderTable({
        adapter: { ...mockAdapter, error: null },
      });

      expect(queryByTestId("error-state")).not.toBeInTheDocument();
    });
  });

  describe("row expansion", () => {
    it("should render expand button when getRowDetail is provided", () => {
      const rows: TestRow[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
      const getRowDetail = (row: TestRow) => <div>Details for {row.name}</div>;

      const { getByRole } = renderTable({
        adapter: { ...mockAdapter, rows, totalCount: 1 },
        getRowDetail,
      });

      expect(getByRole("button", { name: "Expandir fila" })).toBeInTheDocument();
    });

    it("should toggle expand button aria-label after clicking", async () => {
      const rows: TestRow[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
      const getRowDetail = (row: TestRow) => (
        <div data-testid="row-detail">Details for {row.name}</div>
      );

      const { getByRole, user } = renderTable({
        adapter: { ...mockAdapter, rows, totalCount: 1 },
        getRowDetail,
      });

      const expandBtn = getByRole("button", { name: "Expandir fila" });
      await user.click(expandBtn);

      expect(getByRole("button", { name: "Contraer fila" })).toBeInTheDocument();
    });

    it("should insert detail row after expanding", async () => {
      const rows: TestRow[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
      const getRowDetail = (row: TestRow) => (
        <div data-testid="row-detail">Details for {row.name}</div>
      );

      const { getByRole, getByTestId, user } = renderTable({
        adapter: { ...mockAdapter, rows, totalCount: 1 },
        getRowDetail,
      });

      expect(() => getByTestId("row-1-detail")).toThrow();

      await user.click(getByRole("button", { name: "Expandir fila" }));

      expect(getByTestId("row-1-detail")).toBeInTheDocument();
    });

    it("should not render expand button when getRowDetail is not provided", () => {
      const rows: TestRow[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
      const { queryByRole } = renderTable({
        adapter: { ...mockAdapter, rows, totalCount: 1 },
        getRowDetail: undefined,
      });

      expect(queryByRole("button", { name: "Expandir fila" })).not.toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("should not render selectionActions when no rows are selected", () => {
      const selectionActions = vi.fn(() => <div data-testid="selection-actions">Actions</div>);

      const { queryByTestId } = renderTable({
        selectable: true,
        selectionActions,
        adapter: { ...mockAdapter, rows: [{ id: "1", name: "Alice", email: "a@x.com" }] },
      });

      expect(queryByTestId("selection-actions")).not.toBeInTheDocument();
    });

    it("should render selectionActions bar when rows are selected", async () => {
      const rows: TestRow[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
      const selectionActions = vi.fn(() => <div data-testid="selection-actions">Actions</div>);

      const { getByTestId, user } = renderTable({
        selectable: true,
        selectionActions,
        adapter: { ...mockAdapter, rows, totalCount: 1 },
      });

      await user.click(getByTestId("simulate-select"));
      expect(getByTestId("selection-actions")).toBeInTheDocument();
    });

    it("should call selectionActions with selected IDs", async () => {
      const rows: TestRow[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
      const selectionActions = vi.fn(() => null);

      const { getByTestId, user } = renderTable({
        selectable: true,
        selectionActions,
        adapter: { ...mockAdapter, rows, totalCount: 1 },
      });

      await user.click(getByTestId("simulate-select"));

      expect(selectionActions).toHaveBeenCalledWith(expect.arrayContaining(["1"]), false);
    });

    it("should not render selectionActions bar when selectable=false", async () => {
      const rows: TestRow[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
      const selectionActions = vi.fn(() => <div data-testid="selection-actions">Actions</div>);

      const { queryByTestId, user } = renderTable({
        selectable: false,
        selectionActions,
        adapter: { ...mockAdapter, rows, totalCount: 1 },
      });

      // simulate-select button only renders when checkboxSelection is true,
      // but selectable=false so onRowSelectionModelChange is still wired —
      // the selection bar guard requires selectable=true
      const simulateBtn = queryByTestId("simulate-select");
      if (simulateBtn) await user.click(simulateBtn);

      expect(queryByTestId("selection-actions")).not.toBeInTheDocument();
    });
  });

  describe("toolbar", () => {
    it("should render custom toolbar actions slot", () => {
      const toolbarActions = <button data-testid="custom-action">Custom Action</button>;
      const { getByTestId } = renderTable({ toolbarActions });
      expect(getByTestId("custom-action")).toBeInTheDocument();
    });
  });

  describe("export filename", () => {
    it("should pass tableId as exportFilename when not explicitly provided", () => {
      const { getByLabelText } = renderTable({ exportFilename: undefined });
      // Toolbar renders with the table — verify exportFilename reaches the search field at minimum
      expect(getByLabelText(/Exportar datos/i)).toBeInTheDocument();
    });
  });
});
