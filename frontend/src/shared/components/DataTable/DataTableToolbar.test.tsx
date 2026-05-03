import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GridColDef } from "@mui/x-data-grid";

import { renderWithProviders } from "@/tests/utils";
import { DataTableToolbar } from "./DataTableToolbar";
import type { DataTableToolbarProps } from "./types";

const mockColumns: GridColDef[] = [
  { field: "name", headerName: "Nombre" },
  { field: "email", headerName: "Correo" },
];

function buildProps(overrides: Partial<DataTableToolbarProps> = {}): DataTableToolbarProps {
  return {
    tableId: "test-table",
    totalCount: 0,
    page: 0,
    pageSize: 10,
    searchValue: "",
    searchMode: "client",
    onSearchChange: vi.fn(),
    columns: mockColumns,
    columnVisibility: {},
    onColumnVisibilityChange: vi.fn(),
    columnOrder: ["name", "email"],
    onColumnOrderChange: vi.fn(),
    exportFilename: "test-export",
    rows: [],
    visibleColumns: mockColumns,
    selectable: false,
    selectedCount: 0,
    allServerSelected: false,
    onSelectAllServer: vi.fn(),
    onClearSelection: vi.fn(),
    showSelectAllServerButton: false,
    selectedIds: [],
    ...overrides,
  };
}

function renderToolbar(overrides: Partial<DataTableToolbarProps> = {}) {
  return renderWithProviders(<DataTableToolbar {...buildProps(overrides)} />);
}

describe("DataTableToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Counter label
  // -----------------------------------------------------------------------

  describe("counter label", () => {
    it("should show 'Sin resultados' when totalCount=0", () => {
      const { getByText } = renderToolbar({ totalCount: 0 });
      expect(getByText("Sin resultados")).toBeInTheDocument();
    });

    it("should show correct range on page 0", () => {
      const { getByText } = renderToolbar({ totalCount: 47, page: 0, pageSize: 10 });
      expect(getByText("Mostrando 1–10 de 47")).toBeInTheDocument();
    });

    it("should clamp the upper bound on the last partial page", () => {
      const { getByText } = renderToolbar({ totalCount: 47, page: 4, pageSize: 10 });
      expect(getByText("Mostrando 41–47 de 47")).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Search field
  // -----------------------------------------------------------------------

  describe("search field", () => {
    it("should show placeholder 'Buscar...' in client mode", () => {
      const { getByPlaceholderText } = renderToolbar({ searchMode: "client" });
      expect(getByPlaceholderText("Buscar...")).toBeInTheDocument();
    });

    it("should show placeholder 'Buscar en el servidor...' in server mode", () => {
      const { getByPlaceholderText } = renderToolbar({ searchMode: "server" });
      expect(getByPlaceholderText("Buscar en el servidor...")).toBeInTheDocument();
    });

    it("should call onSearchChange when the user types", async () => {
      const onSearchChange = vi.fn();
      const { getByPlaceholderText, user } = renderToolbar({ onSearchChange });
      await user.type(getByPlaceholderText("Buscar..."), "juan");
      expect(onSearchChange).toHaveBeenCalledWith(expect.stringContaining("j"));
    });
  });

  // -----------------------------------------------------------------------
  // Column visibility popover
  // -----------------------------------------------------------------------

  describe("column popover", () => {
    it("should open the popover when the column button is clicked", async () => {
      const { getByRole, getByText, user } = renderToolbar();
      await user.click(getByRole("button", { name: "Configurar columnas" }));
      expect(getByText("Columnas visibles")).toBeInTheDocument();
    });

    it("should list all columns in the popover", async () => {
      const { getByRole, getByText, user } = renderToolbar();
      await user.click(getByRole("button", { name: "Configurar columnas" }));
      expect(getByText("Nombre")).toBeInTheDocument();
      expect(getByText("Correo")).toBeInTheDocument();
    });

    it("should call onColumnVisibilityChange when a checkbox is toggled", async () => {
      const onColumnVisibilityChange = vi.fn();
      const { getByRole, getByLabelText, user } = renderToolbar({ onColumnVisibilityChange });
      await user.click(getByRole("button", { name: "Configurar columnas" }));
      const checkbox = getByLabelText("Nombre") as HTMLInputElement;
      await user.click(checkbox);
      expect(onColumnVisibilityChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: false }),
      );
    });

    it("should disable the 'move up' button for the first column", async () => {
      const { getByRole, user } = renderToolbar();
      await user.click(getByRole("button", { name: "Configurar columnas" }));
      expect(getByRole("button", { name: "Mover Nombre arriba" })).toBeDisabled();
    });

    it("should disable the 'move down' button for the last column", async () => {
      const { getByRole, user } = renderToolbar();
      await user.click(getByRole("button", { name: "Configurar columnas" }));
      expect(getByRole("button", { name: "Mover Correo abajo" })).toBeDisabled();
    });

    it("should call onColumnOrderChange with swapped order when 'move down' is clicked", async () => {
      const onColumnOrderChange = vi.fn();
      const { getByRole, user } = renderToolbar({ onColumnOrderChange });
      await user.click(getByRole("button", { name: "Configurar columnas" }));
      await user.click(getByRole("button", { name: "Mover Nombre abajo" }));
      expect(onColumnOrderChange).toHaveBeenCalledWith(["email", "name"]);
    });

    it("should call onColumnOrderChange with swapped order when 'move up' is clicked", async () => {
      const onColumnOrderChange = vi.fn();
      const { getByRole, user } = renderToolbar({ onColumnOrderChange });
      await user.click(getByRole("button", { name: "Configurar columnas" }));
      await user.click(getByRole("button", { name: "Mover Correo arriba" }));
      expect(onColumnOrderChange).toHaveBeenCalledWith(["email", "name"]);
    });
  });

  // -----------------------------------------------------------------------
  // Export menu
  // -----------------------------------------------------------------------

  describe("export menu", () => {
    it("should open the export menu when the export button is clicked", async () => {
      const { getByRole, user } = renderToolbar();
      await user.click(getByRole("button", { name: "Exportar datos" }));
      expect(getByRole("menuitem", { name: "Exportar como Excel (.xlsx)" })).toBeInTheDocument();
    });

    it("should show all three export format options", async () => {
      const { getByRole, user } = renderToolbar();
      await user.click(getByRole("button", { name: "Exportar datos" }));
      expect(getByRole("menuitem", { name: "Exportar como Excel (.xlsx)" })).toBeInTheDocument();
      expect(getByRole("menuitem", { name: "Exportar como CSV (.csv)" })).toBeInTheDocument();
      expect(getByRole("menuitem", { name: "Exportar como PDF (.pdf)" })).toBeInTheDocument();
    });

    it("should close the export menu after selecting an option (CSV)", async () => {
      // Mock URL.createObjectURL to prevent jsdom errors in the export handler
      const createObjectURL = vi.fn(() => "blob:fake");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

      const { getByRole, queryByRole, user } = renderToolbar({
        rows: [{ id: "1", name: "Alice", email: "alice@example.com" }],
        visibleColumns: mockColumns,
      });
      await user.click(getByRole("button", { name: "Exportar datos" }));
      await user.click(getByRole("menuitem", { name: "Exportar como CSV (.csv)" }));

      expect(queryByRole("menuitem", { name: "Exportar como CSV (.csv)" })).not.toBeInTheDocument();

      vi.unstubAllGlobals();
    });
  });

  // -----------------------------------------------------------------------
  // Selection chip
  // -----------------------------------------------------------------------

  describe("selection chip", () => {
    it("should not render selection chip when selectable=false", () => {
      const { queryByText } = renderToolbar({
        selectable: false,
        selectedCount: 5,
      });
      expect(queryByText(/filas? seleccionadas?/i)).not.toBeInTheDocument();
    });

    it("should not render selection chip when selectedCount=0 and allServerSelected=false", () => {
      const { queryByText } = renderToolbar({
        selectable: true,
        selectedCount: 0,
        allServerSelected: false,
      });
      expect(queryByText(/filas? seleccionadas?/i)).not.toBeInTheDocument();
    });

    it("should render chip with singular label for selectedCount=1", () => {
      const { getByText } = renderToolbar({
        selectable: true,
        selectedCount: 1,
      });
      expect(getByText("1 fila seleccionada")).toBeInTheDocument();
    });

    it("should render chip with plural label for selectedCount=3", () => {
      const { getByText } = renderToolbar({
        selectable: true,
        selectedCount: 3,
      });
      expect(getByText("3 filas seleccionadas")).toBeInTheDocument();
    });

    it("should render chip with full-server label when allServerSelected=true", () => {
      const { getByText } = renderToolbar({
        selectable: true,
        allServerSelected: true,
        totalCount: 200,
        selectedCount: 0,
      });
      expect(getByText("Todas las 200 filas seleccionadas")).toBeInTheDocument();
    });

    it("should call onClearSelection when the chip delete icon is clicked", async () => {
      const onClearSelection = vi.fn();
      const { getByTestId, user } = renderToolbar({
        selectable: true,
        selectedCount: 2,
        onClearSelection,
      });
      // MUI Chip delete icon renders with data-testid="CancelIcon" (aria-hidden)
      await user.click(getByTestId("CancelIcon"));
      expect(onClearSelection).toHaveBeenCalledOnce();
    });
  });

  // -----------------------------------------------------------------------
  // "Select all server" button
  // -----------------------------------------------------------------------

  describe("select all server button", () => {
    it("should render when showSelectAllServerButton=true and allServerSelected=false", () => {
      const { getByRole } = renderToolbar({
        selectable: true,
        selectedCount: 10,
        showSelectAllServerButton: true,
        allServerSelected: false,
        totalCount: 500,
      });
      expect(getByRole("button", { name: /Seleccionar las 500 filas/i })).toBeInTheDocument();
    });

    it("should call onSelectAllServer when clicked", async () => {
      const onSelectAllServer = vi.fn();
      const { getByRole, user } = renderToolbar({
        selectable: true,
        selectedCount: 10,
        showSelectAllServerButton: true,
        allServerSelected: false,
        totalCount: 500,
        onSelectAllServer,
      });
      await user.click(getByRole("button", { name: /Seleccionar las 500 filas/i }));
      expect(onSelectAllServer).toHaveBeenCalledOnce();
    });

    it("should NOT render when allServerSelected=true", () => {
      const { queryByRole } = renderToolbar({
        selectable: true,
        showSelectAllServerButton: true,
        allServerSelected: true,
        totalCount: 500,
      });
      expect(queryByRole("button", { name: /Seleccionar las/i })).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Custom toolbar actions slot
  // -----------------------------------------------------------------------

  describe("toolbar actions slot", () => {
    it("should render custom actions when provided", () => {
      const { getByTestId } = renderToolbar({
        toolbarActions: <button data-testid="new-item">+ Nuevo</button>,
      });
      expect(getByTestId("new-item")).toBeInTheDocument();
    });

    it("should not render the actions section when toolbarActions is not provided", () => {
      const { queryByTestId } = renderToolbar({ toolbarActions: undefined });
      expect(queryByTestId("new-item")).not.toBeInTheDocument();
    });
  });
});
