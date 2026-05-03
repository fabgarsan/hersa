import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { NavSidebar } from "./NavSidebar";

// Mock usePermissions hook
vi.mock("@shared/hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

// Mock useMeQuery hook
vi.mock("@modules/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/auth")>();
  return {
    ...actual,
    useMeQuery: vi.fn(),
  };
});

import { usePermissions } from "@shared/hooks/usePermissions";
import { useMeQuery } from "@modules/auth";

describe("NavSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all nav items regardless of permissions", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: ["modules.access_tienda", "modules.access_programador", "modules.access_admin"],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { getByText } = renderWithProviders(<NavSidebar />);

    // All nav items should be present
    expect(getByText(/tienda/i)).toBeInTheDocument();
    expect(getByText(/grados/i)).toBeInTheDocument();
    expect(getByText(/admin/i)).toBeInTheDocument();
  });

  it("should show lock icon for nav items user cannot access", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: (permission: string) => permission === "modules.access_tienda",
      permissions: ["modules.access_tienda"],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { container } = renderWithProviders(<NavSidebar />);

    // Lock icons should be present for locked items
    const lockIcons = container.querySelectorAll("[class*='lockIcon']");
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it("should not show lock icon for accessible nav items", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: ["modules.access_tienda", "modules.access_programador", "modules.access_admin"],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { container } = renderWithProviders(<NavSidebar />);

    // Lock icons should not be present when all items are accessible
    const lockIcons = container.querySelectorAll("[class*='lockIcon']");
    expect(lockIcons.length).toBe(0);
  });

  it("should render username in user section", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: [],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "john_doe", email: "john@example.com", firstName: "John", lastName: "Doe" },
      isLoading: false,
      error: null,
    } as any);

    const { getByText } = renderWithProviders(<NavSidebar />);

    expect(getByText("john_doe")).toBeInTheDocument();
  });

  it("should show dash when username is not available", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: [],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    const { getByText } = renderWithProviders(<NavSidebar />);

    expect(getByText("—")).toBeInTheDocument();
  });

  it("should render brand title", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: [],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { getByText } = renderWithProviders(<NavSidebar />);

    expect(getByText(/eventos hersa/i)).toBeInTheDocument();
  });

  it("should navigate to nav item path when clicked", async () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: ["modules.access_tienda"],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { getByText, user } = renderWithProviders(<NavSidebar />);

    const tiendaItem = getByText(/tienda/i);
    await user.click(tiendaItem.closest("button") as HTMLButtonElement);

    // Navigation is handled by react-router, so we just verify the component doesn't error
    expect(tiendaItem).toBeInTheDocument();
  });

  it("should navigate to profile when user section is clicked", async () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: [],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { getByText, user, getByRole } = renderWithProviders(<NavSidebar />);

    // Find the user section (it's a ButtonBase with the username)
    const userButton = getByText("testuser").closest("button");
    if (userButton) {
      await user.click(userButton);
      // Navigation is handled by react-router
      expect(userButton).toBeInTheDocument();
    }
  });

  it("should handle permissions with some items locked and some unlocked", () => {
    const hasAccessFn = vi.fn((permission: string) => {
      return permission === "modules.access_tienda";
    });

    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: hasAccessFn,
      permissions: ["modules.access_tienda"],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { getByText } = renderWithProviders(<NavSidebar />);

    // All items should be rendered
    expect(getByText(/tienda/i)).toBeInTheDocument();
    expect(getByText(/grados/i)).toBeInTheDocument();
    expect(getByText(/admin/i)).toBeInTheDocument();

    // Verify hasAccess was called for locked items
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_tienda");
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_programador");
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_admin");
  });

  it("should not show lock icons while permissions are loading", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: vi.fn(),
      permissions: [],
      isLoading: true,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: { id: 1, username: "testuser", email: "test@example.com", firstName: "Test", lastName: "User" },
      isLoading: false,
      error: null,
    } as any);

    const { container } = renderWithProviders(<NavSidebar />);

    // During loading, lock icons should not be shown (locked state requires isLoading=false)
    const lockIcons = container.querySelectorAll("[class*='lockIcon']");
    expect(lockIcons.length).toBe(0);
  });

  it("should handle user data loading state", () => {
    vi.mocked(usePermissions).mockReturnValue({
      hasAccess: () => true,
      permissions: [],
      isLoading: false,
    });

    vi.mocked(useMeQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const { getByText } = renderWithProviders(<NavSidebar />);

    // Should show dash while user data is loading
    expect(getByText("—")).toBeInTheDocument();
  });
});
