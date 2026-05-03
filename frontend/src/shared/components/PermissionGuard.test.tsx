import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { PermissionGuard } from "./PermissionGuard";
import Button from "@mui/material/Button";

// Mock usePermissions hook
vi.mock("@shared/hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

import { usePermissions } from "@shared/hooks/usePermissions";

describe("PermissionGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when permission is granted", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: ["users.create"],
      isLoading: false,
    });

    const { getByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.create"]]}>
        <div>Create User Button</div>
      </PermissionGuard>
    );

    expect(getByText("Create User Button")).toBeInTheDocument();
  });

  it("should hide children when permission is denied with hidden behavior", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => false,
      permissions: [],
      isLoading: false,
    });

    const { queryByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.create"]]} unauthorizedBehavior="hidden">
        <div>Create User Button</div>
      </PermissionGuard>
    );

    expect(queryByText("Create User Button")).not.toBeInTheDocument();
  });

  it("should disable children when permission is denied with disabled behavior", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => false,
      permissions: [],
      isLoading: false,
    });

    const { getByRole } = renderWithProviders(
      <PermissionGuard
        requiredPermissions={[["users.create"]]}
        unauthorizedBehavior="disabled"
      >
        <Button>Create User</Button>
      </PermissionGuard>
    );

    const button = getByRole("button", { name: /create user/i });
    expect(button).toBeDisabled();
  });

  it("should render children when OR condition is met (multiple permission groups)", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: (permission: string) => permission === "users.create",
      permissions: ["users.create"],
      isLoading: false,
    });

    const { getByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["admin.access"], ["users.create"]]}>
        <div>Action Button</div>
      </PermissionGuard>
    );

    // Should render because "users.create" is available (second group)
    expect(getByText("Action Button")).toBeInTheDocument();
  });

  it("should render children when AND condition is met (multiple permissions in group)", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: (permission: string) =>
        permission === "users.create" || permission === "users.edit",
      permissions: ["users.create", "users.edit"],
      isLoading: false,
    });

    const { getByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["users.create", "users.edit"]]}>
        <div>Bulk Action</div>
      </PermissionGuard>
    );

    // Should render because both "users.create" AND "users.edit" are available
    expect(getByText("Bulk Action")).toBeInTheDocument();
  });

  it("should hide children when AND condition is not met", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: (permission: string) => permission === "users.create",
      permissions: ["users.create"],
      isLoading: false,
    });

    const { queryByText } = renderWithProviders(
      <PermissionGuard
        requiredPermissions={[["users.create", "users.delete"]]}
        unauthorizedBehavior="hidden"
      >
        <div>Danger Zone</div>
      </PermissionGuard>
    );

    // Should not render because "users.delete" is missing
    expect(queryByText("Danger Zone")).not.toBeInTheDocument();
  });

  it("should render children without permission check when requiredPermissions is undefined", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => false,
      permissions: [],
      isLoading: false,
    });

    const { getByText } = renderWithProviders(
      <PermissionGuard>
        <div>Public Content</div>
      </PermissionGuard>
    );

    // Should render even though user has no permissions
    expect(getByText("Public Content")).toBeInTheDocument();
  });

  it("should show tooltip when permission is denied and tooltip text provided", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => false,
      permissions: [],
      isLoading: false,
    });

    const { getByRole, getByText } = renderWithProviders(
      <PermissionGuard
        requiredPermissions={[["users.delete"]]}
        unauthorizedBehavior="disabled"
        unauthorizedTooltip="No tienes permiso para eliminar"
      >
        <Button>Delete User</Button>
      </PermissionGuard>
    );

    // The button should be present but disabled
    const button = getByRole("button", { name: /delete user/i });
    expect(button).toBeDisabled();

    // Tooltip text should be in the document (rendered via Tooltip component)
    expect(getByText("No tienes permiso para eliminar")).toBeInTheDocument();
  });

  it("should not show tooltip when tooltip is not provided", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => false,
      permissions: [],
      isLoading: false,
    });

    const { queryByText } = renderWithProviders(
      <PermissionGuard
        requiredPermissions={[["users.delete"]]}
        unauthorizedBehavior="disabled"
      >
        <Button>Delete User</Button>
      </PermissionGuard>
    );

    // If a tooltip text is provided, it should not appear
    expect(queryByText(/no tienes permiso/i)).not.toBeInTheDocument();
  });

  it("should handle complex permission logic (OR and AND combined)", () => {
    const hasAccessFn = vi.fn((permission: string) => {
      const adminPerms = ["admin.full_access"];
      const userPerms = ["users.create", "users.edit"];
      return adminPerms.includes(permission) || userPerms.includes(permission);
    });

    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: hasAccessFn,
      permissions: ["users.create", "users.edit"],
      isLoading: false,
    });

    const { getByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["admin.full_access"], ["users.create", "users.edit"]]}>
        <div>Complex Action</div>
      </PermissionGuard>
    );

    // Should render because the second group (users.create AND users.edit) is satisfied
    expect(getByText("Complex Action")).toBeInTheDocument();
  });

  it("should default to hidden behavior when unauthorizedBehavior is not specified", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => false,
      permissions: [],
      isLoading: false,
    });

    const { queryByText } = renderWithProviders(
      <PermissionGuard requiredPermissions={[["secret.access"]]}>
        <div>Secret Content</div>
      </PermissionGuard>
    );

    // Default is "hidden", so should not render
    expect(queryByText("Secret Content")).not.toBeInTheDocument();
  });
});
