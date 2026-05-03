import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { ModuleGuard } from "./ModuleGuard";

vi.mock("@shared/hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

import { usePermissions } from "@shared/hooks/usePermissions";

function mockPermissions(
  hasAccessFn: (p: string) => boolean = () => false,
  permissions: string[] = [],
  isLoading = false,
) {
  vi.mocked(usePermissions).mockReturnValue({ hasAccess: hasAccessFn, permissions, isLoading });
}

describe("ModuleGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render LoadingState while permissions are loading", () => {
    mockPermissions(() => false, [], true);
    const { getByRole } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Protected Module Content</div>
      </ModuleGuard>,
    );
    expect(getByRole("progressbar", { hidden: true })).toBeInTheDocument();
  });

  it("should render children when user has access to module", () => {
    mockPermissions((p) => p === "modules.access_tienda", ["modules.access_tienda"]);
    const { getByText } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Protected Module Content</div>
      </ModuleGuard>,
    );
    expect(getByText("Protected Module Content")).toBeInTheDocument();
  });

  it("should render access denied UI when user lacks module access", () => {
    mockPermissions((p) => p === "modules.access_admin", ["modules.access_admin"]);
    const { getByText, container, queryByText } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Protected Module Content</div>
      </ModuleGuard>,
    );
    expect(getByText("No tienes acceso a esta sección")).toBeInTheDocument();
    expect(getByText("Contacta al administrador si necesitas acceso.")).toBeInTheDocument();
    expect(container.querySelector("[class*='accessDeniedIcon']")).toBeInTheDocument();
    expect(queryByText("Protected Module Content")).not.toBeInTheDocument();
  });

  it("should not render children when access is denied", () => {
    mockPermissions(() => false);
    const { queryByText } = renderWithProviders(
      <ModuleGuard module="modules.access_admin">
        <div>Admin Panel</div>
      </ModuleGuard>,
    );
    expect(queryByText("Admin Panel")).not.toBeInTheDocument();
  });

  it("should handle different module permissions correctly", () => {
    const hasAccessFn = vi.fn((p: string) =>
      ["modules.access_tienda", "modules.access_programador"].includes(p),
    );
    mockPermissions(hasAccessFn, ["modules.access_tienda", "modules.access_programador"]);
    const { getByText } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Store Module</div>
      </ModuleGuard>,
    );
    expect(getByText("Store Module")).toBeInTheDocument();
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_tienda");
  });

  it("should render access denied for admin module when user lacks permission", () => {
    mockPermissions((p) => p === "modules.access_tienda", ["modules.access_tienda"]);
    const { queryByText, getByText } = renderWithProviders(
      <ModuleGuard module="modules.access_admin">
        <div>Admin Content</div>
      </ModuleGuard>,
    );
    expect(getByText("No tienes acceso a esta sección")).toBeInTheDocument();
    expect(queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("should transition from loading to access granted", () => {
    mockPermissions(() => false, [], true);
    const { rerender, getByText, getByRole } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Module Content</div>
      </ModuleGuard>,
    );

    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: vi.fn(),
      permissions: [],
      isLoading: true,
    });
    rerender(
      <ModuleGuard module="modules.access_tienda">
        <div>Module Content</div>
      </ModuleGuard>,
    );
    expect(getByRole("progressbar", { hidden: true })).toBeInTheDocument();

    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: ["modules.access_tienda"],
      isLoading: false,
    });
    rerender(
      <ModuleGuard module="modules.access_tienda">
        <div>Module Content</div>
      </ModuleGuard>,
    );
    expect(getByText("Module Content")).toBeInTheDocument();
  });
});
