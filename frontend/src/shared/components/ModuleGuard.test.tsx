import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { ModuleGuard } from "./ModuleGuard";

// Mock usePermissions hook
vi.mock("@shared/hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

import { usePermissions } from "@shared/hooks/usePermissions";

describe("ModuleGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render LoadingState while permissions are loading", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: vi.fn(),
      permissions: [],
      isLoading: true,
    });

    const { getByRole } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Protected Module Content</div>
      </ModuleGuard>
    );

    // LoadingState renders a spinner or skeleton
    expect(getByRole("progressbar", { hidden: true })).toBeInTheDocument();
  });

  it("should render children when user has access to module", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: (permission: string) => permission === "modules.access_tienda",
      permissions: ["modules.access_tienda"],
      isLoading: false,
    });

    const { getByText } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Protected Module Content</div>
      </ModuleGuard>
    );

    expect(getByText("Protected Module Content")).toBeInTheDocument();
  });

  it("should render access denied UI when user lacks module access", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: (permission: string) => permission === "modules.access_admin",
      permissions: ["modules.access_admin"],
      isLoading: false,
    });

    const { getByText, getByRole } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Protected Module Content</div>
      </ModuleGuard>
    );

    // Should show access denied message
    expect(getByText("No tienes acceso a esta sección")).toBeInTheDocument();
    expect(getByText("Contacta al administrador si necesitas acceso.")).toBeInTheDocument();

    // Should show lock icon
    expect(getByRole("img", { hidden: true })).toBeInTheDocument();

    // Should not render children
    expect(getByText("Protected Module Content")).not.toBeInTheDocument();
  });

  it("should not render children when access is denied", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => false,
      permissions: [],
      isLoading: false,
    });

    const { queryByText } = renderWithProviders(
      <ModuleGuard module="modules.access_admin">
        <div>Admin Panel</div>
      </ModuleGuard>
    );

    expect(queryByText("Admin Panel")).not.toBeInTheDocument();
  });

  it("should handle different module permissions correctly", () => {
    const hasAccessFn = vi.fn((permission: string) => {
      const allowedPermissions = [
        "modules.access_tienda",
        "modules.access_programador",
      ];
      return allowedPermissions.includes(permission);
    });

    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: hasAccessFn,
      permissions: ["modules.access_tienda", "modules.access_programador"],
      isLoading: false,
    });

    const { getByText } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Store Module</div>
      </ModuleGuard>
    );

    expect(getByText("Store Module")).toBeInTheDocument();
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_tienda");
  });

  it("should render access denied for admin module when user lacks permission", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: (permission: string) => permission === "modules.access_tienda",
      permissions: ["modules.access_tienda"],
      isLoading: false,
    });

    const { queryByText, getByText } = renderWithProviders(
      <ModuleGuard module="modules.access_admin">
        <div>Admin Content</div>
      </ModuleGuard>
    );

    // Should show access denied
    expect(getByText("No tienes acceso a esta sección")).toBeInTheDocument();

    // Should not render admin content
    expect(queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("should transition from loading to access granted", () => {
    const { rerender, getByText, getByRole, queryByText } = renderWithProviders(
      <ModuleGuard module="modules.access_tienda">
        <div>Module Content</div>
      </ModuleGuard>
    );

    // Start with loading
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: vi.fn(),
      permissions: [],
      isLoading: true,
    });

    rerender(
      <ModuleGuard module="modules.access_tienda">
        <div>Module Content</div>
      </ModuleGuard>
    );

    expect(getByRole("progressbar", { hidden: true })).toBeInTheDocument();

    // Then resolve to access granted
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: ["modules.access_tienda"],
      isLoading: false,
    });

    rerender(
      <ModuleGuard module="modules.access_tienda">
        <div>Module Content</div>
      </ModuleGuard>
    );

    expect(getByText("Module Content")).toBeInTheDocument();
  });
});
