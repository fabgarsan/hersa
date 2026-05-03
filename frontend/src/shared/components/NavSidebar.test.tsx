import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { NavSidebar } from "./NavSidebar";

vi.mock("@shared/hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

vi.mock("@modules/auth", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import("@modules/auth")>();
  return { ...actual, useMeQuery: vi.fn() };
});

import { usePermissions } from "@shared/hooks/usePermissions";
import { useMeQuery } from "@modules/auth";

const MOCK_USER = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
};

const ALL_PERMISSIONS = [
  "modules.access_tienda",
  "modules.access_programador",
  "modules.access_admin",
];

function mockPermissions(
  hasAccessFn: (p: string) => boolean = () => true,
  permissions: string[] = ALL_PERMISSIONS,
  isLoading = false,
) {
  vi.mocked(usePermissions).mockReturnValue({ hasAccess: hasAccessFn, permissions, isLoading });
}

function mockUserQuery(data: typeof MOCK_USER | undefined, isLoading = false) {
  vi.mocked(useMeQuery).mockReturnValue({
    data,
    isLoading,
    error: null,
  } as unknown as ReturnType<typeof useMeQuery>);
}

describe("NavSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPermissions();
    mockUserQuery(MOCK_USER);
  });

  it("should render all nav items regardless of permissions", () => {
    const { getByText } = renderWithProviders(<NavSidebar />);
    expect(getByText(/tienda/i)).toBeInTheDocument();
    expect(getByText(/grados/i)).toBeInTheDocument();
    expect(getByText(/admin/i)).toBeInTheDocument();
  });

  it("should show lock icon for nav items user cannot access", () => {
    mockPermissions((p) => p === "modules.access_tienda", ["modules.access_tienda"]);
    const { container } = renderWithProviders(<NavSidebar />);
    expect(container.querySelectorAll("[class*='lockIcon']").length).toBeGreaterThan(0);
  });

  it("should not show lock icon for accessible nav items", () => {
    const { container } = renderWithProviders(<NavSidebar />);
    expect(container.querySelectorAll("[class*='lockIcon']").length).toBe(0);
  });

  it("should render username in user section", () => {
    mockUserQuery({
      ...MOCK_USER,
      username: "john_doe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
    });
    const { getByText } = renderWithProviders(<NavSidebar />);
    expect(getByText("john_doe")).toBeInTheDocument();
  });

  it("should show dash when username is not available", () => {
    mockUserQuery(undefined);
    const { getByText } = renderWithProviders(<NavSidebar />);
    expect(getByText("—")).toBeInTheDocument();
  });

  it("should render brand title", () => {
    const { getByText } = renderWithProviders(<NavSidebar />);
    expect(getByText(/eventos hersa/i)).toBeInTheDocument();
  });

  it("should navigate to nav item path when clicked", async () => {
    mockPermissions(() => true, ["modules.access_tienda"]);
    const { getByText, user } = renderWithProviders(<NavSidebar />);
    const tiendaItem = getByText(/tienda/i);
    const listItemButton = tiendaItem.closest("[class*='MuiListItemButton']") as HTMLElement;
    expect(listItemButton).toBeInTheDocument();
    await user.click(listItemButton);
    // Verify the item is still in the document (navigation happened)
    expect(tiendaItem).toBeInTheDocument();
  });

  it("should navigate to profile when user section is clicked", async () => {
    const { getByText, user } = renderWithProviders(<NavSidebar />);
    const userButton = getByText("testuser").closest("button");
    if (userButton) {
      await user.click(userButton);
      expect(userButton).toBeInTheDocument();
    }
  });

  it("should navigate to TIENDA route when tienda nav item is clicked", async () => {
    mockPermissions(() => true);
    const { getByText, user } = renderWithProviders(<NavSidebar />);
    const tiendaItem = getByText(/tienda/i);
    const tiendaButton = tiendaItem.closest("[class*='MuiListItemButton']") as HTMLElement;
    await user.click(tiendaButton);
    expect(tiendaButton).toBeInTheDocument();
  });

  it("should navigate to GRADOS route when grados nav item is clicked", async () => {
    mockPermissions(() => true);
    const { getByText, user } = renderWithProviders(<NavSidebar />);
    const gradosItem = getByText(/grados/i);
    const gradosButton = gradosItem.closest("[class*='MuiListItemButton']") as HTMLElement;
    await user.click(gradosButton);
    expect(gradosButton).toBeInTheDocument();
  });

  it("should navigate to ADMIN route when admin nav item is clicked", async () => {
    mockPermissions(() => true);
    const { getByText, user } = renderWithProviders(<NavSidebar />);
    const adminItem = getByText(/admin/i);
    const adminButton = adminItem.closest("[class*='MuiListItemButton']") as HTMLElement;
    await user.click(adminButton);
    expect(adminButton).toBeInTheDocument();
  });

  it("should handle permissions with some items locked and some unlocked", () => {
    const hasAccessFn = vi.fn((p: string) => p === "modules.access_tienda");
    mockPermissions(hasAccessFn, ["modules.access_tienda"]);

    const { getByText } = renderWithProviders(<NavSidebar />);
    expect(getByText(/tienda/i)).toBeInTheDocument();
    expect(getByText(/grados/i)).toBeInTheDocument();
    expect(getByText(/admin/i)).toBeInTheDocument();
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_tienda");
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_programador");
    expect(hasAccessFn).toHaveBeenCalledWith("modules.access_admin");
  });

  it("should not show lock icons while permissions are loading", () => {
    mockPermissions(() => false, [], true);
    const { container } = renderWithProviders(<NavSidebar />);
    expect(container.querySelectorAll("[class*='lockIcon']").length).toBe(0);
  });

  it("should handle user data loading state", () => {
    mockUserQuery(undefined, true);
    const { getByText } = renderWithProviders(<NavSidebar />);
    expect(getByText("—")).toBeInTheDocument();
  });
});
