import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { PermissionGuard } from "./PermissionGuard";
import Button from "@mui/material/Button";

vi.mock("@shared/hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

import { usePermissions } from "@shared/hooks/usePermissions";

function mockPermissions(
  hasAccessFn: (p: string) => boolean = () => false,
  permissions: string[] = [],
) {
  vi.mocked(usePermissions).mockReturnValue({
    hasAccess: hasAccessFn,
    permissions,
    isLoading: false,
  });
}

describe("PermissionGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPermissions(); // default: no permissions granted — safe stub for any future test
  });

  it("should render children when permission is granted", () => {
    mockPermissions(() => true, ["users.create"]);
    const { getByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.create"]]}>
        <div>Create User Button</div>
      </PermissionGuard>,
    );
    expect(getByText("Create User Button")).toBeInTheDocument();
  });

  it("should hide children when permission is denied with hidden behavior", () => {
    mockPermissions();
    const { queryByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.create"]]} unauthorizedBehavior="hidden">
        <div>Create User Button</div>
      </PermissionGuard>,
    );
    expect(queryByText("Create User Button")).not.toBeInTheDocument();
  });

  it("should disable children when permission is denied with disabled behavior", () => {
    mockPermissions();
    const { getByRole } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.create"]]} unauthorizedBehavior="disabled">
        <Button>Create User</Button>
      </PermissionGuard>,
    );
    expect(getByRole("button", { name: /create user/i })).toBeDisabled();
  });

  it("should render children when OR condition is met (multiple permission groups)", () => {
    mockPermissions((p) => p === "users.create", ["users.create"]);
    const { getByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["admin.access"], ["users.create"]]}>
        <div>Action Button</div>
      </PermissionGuard>,
    );
    expect(getByText("Action Button")).toBeInTheDocument();
  });

  it("should render children when AND condition is met (multiple permissions in group)", () => {
    mockPermissions(
      (p) => p === "users.create" || p === "users.edit",
      ["users.create", "users.edit"],
    );
    const { getByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.create", "users.edit"]]}>
        <div>Bulk Action</div>
      </PermissionGuard>,
    );
    expect(getByText("Bulk Action")).toBeInTheDocument();
  });

  it("should hide children when AND condition is not met", () => {
    mockPermissions((p) => p === "users.create", ["users.create"]);
    const { queryByText } = renderWithProviders(
      <PermissionGuard
        requiredPermissions={[["users.create", "users.delete"]]}
        unauthorizedBehavior="hidden"
      >
        <div>Danger Zone</div>
      </PermissionGuard>,
    );
    expect(queryByText("Danger Zone")).not.toBeInTheDocument();
  });

  it("should render children without permission check when requiredPermissions is undefined", () => {
    mockPermissions();
    const { getByText } = renderWithProviders(
      <PermissionGuard>
        <div>Public Content</div>
      </PermissionGuard>,
    );
    expect(getByText("Public Content")).toBeInTheDocument();
  });

  it("should show tooltip when permission is denied and tooltip text provided", () => {
    mockPermissions();
    const { getByRole, container } = renderWithProviders(
      <PermissionGuard
        requiredPermissions={[["users.delete"]]}
        unauthorizedBehavior="disabled"
        unauthorizedTooltip="No tienes permiso para eliminar"
      >
        <Button>Delete User</Button>
      </PermissionGuard>,
    );
    expect(getByRole("button", { name: /delete user/i })).toBeDisabled();
    const tooltipWrapper = container.querySelector("[aria-label*='permiso']");
    expect(tooltipWrapper).toBeInTheDocument();
    expect(tooltipWrapper?.getAttribute("aria-label")).toBe("No tienes permiso para eliminar");
  });

  it("should not show tooltip when tooltip is not provided", () => {
    mockPermissions();
    const { queryByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.delete"]]} unauthorizedBehavior="disabled">
        <Button>Delete User</Button>
      </PermissionGuard>,
    );
    expect(queryByText(/no tienes permiso/i)).not.toBeInTheDocument();
  });

  it("should handle complex permission logic (OR and AND combined)", () => {
    const hasAccessFn = vi.fn((p: string) =>
      ["admin.full_access", "users.create", "users.edit"].includes(p),
    );
    mockPermissions(hasAccessFn, ["users.create", "users.edit"]);
    const { getByText } = renderWithProviders(
      <PermissionGuard
        requiredPermissions={[["admin.full_access"], ["users.create", "users.edit"]]}
      >
        <div>Complex Action</div>
      </PermissionGuard>,
    );
    expect(getByText("Complex Action")).toBeInTheDocument();
  });

  it("should default to hidden behavior when unauthorizedBehavior is not specified", () => {
    mockPermissions();
    const { queryByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["secret.access"]]}>
        <div>Secret Content</div>
      </PermissionGuard>,
    );
    expect(queryByText("Secret Content")).not.toBeInTheDocument();
  });
});
