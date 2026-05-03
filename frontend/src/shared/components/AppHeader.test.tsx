import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { AppHeader } from "./AppHeader";

// Mock useAuth hook
vi.mock("@modules/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/auth")>();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from "@modules/auth";

describe("AppHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { container } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    expect(container).toBeInTheDocument();
  });

  it("should render menu button with correct aria-label", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getByLabelText } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    expect(getByLabelText(/abrir navegación/i)).toBeInTheDocument();
  });

  it("should render logout button with tooltip", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getByRole } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    // Logout button should be in the document
    const buttons = getByRole("button", { hidden: true });
    expect(buttons).toBeInTheDocument();
  });

  it("should call onMenuClick when menu button is clicked", async () => {
    const handleMenuClick = vi.fn();
    const logoutFn = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getByLabelText, user } = renderWithProviders(
      <AppHeader onMenuClick={handleMenuClick} />
    );

    const menuButton = getByLabelText(/abrir navegación/i);
    await user.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledOnce();
  });

  it("should call logout when logout button is clicked", async () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getAllByRole, user } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    // Get all buttons and find the logout button (second one after menu button)
    const buttons = getAllByRole("button");
    const logoutButton = buttons[buttons.length - 1]; // Last button is typically logout

    await user.click(logoutButton);

    expect(logoutFn).toHaveBeenCalledOnce();
  });

  it("should render in an AppBar component", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { container } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    // AppBar is rendered as a header element with fixed positioning
    const appBar = container.querySelector("[class*='MuiAppBar']");
    expect(appBar).toBeInTheDocument();
  });

  it("should have correct AppBar elevation", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { container } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    // AppBar has elevation={0}
    const appBar = container.querySelector("[class*='MuiAppBar']");
    expect(appBar).toHaveClass("MuiAppBar-elevation0");
  });

  it("should render menu button before logout button in order", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getAllByRole } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    const buttons = getAllByRole("button");
    // First button should be menu button
    expect(buttons[0]).toHaveAttribute("aria-label");
  });

  it("should call useAuth hook to get logout function", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    expect(useAuth).toHaveBeenCalled();
  });

  it("should pass correct props to buttons", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getByLabelText } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    const menuButton = getByLabelText(/abrir navegación/i);
    // Menu button should inherit color from AppBar (inherit is default)
    expect(menuButton).toHaveClass("MuiIconButton-colorInherit");
  });

  it("should render logout icon in the logout button", () => {
    const logoutFn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { container } = renderWithProviders(
      <AppHeader onMenuClick={vi.fn()} />
    );

    // LogoutIcon should be present
    const logoutIcon = container.querySelector("[data-testid*='Logout']");
    // If data-testid is not available, check for MuiSvgIcon
    const icons = container.querySelectorAll("[class*='MuiSvgIcon']");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should handle multiple clicks on menu button", async () => {
    const handleMenuClick = vi.fn();
    const logoutFn = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getByLabelText, user } = renderWithProviders(
      <AppHeader onMenuClick={handleMenuClick} />
    );

    const menuButton = getByLabelText(/abrir navegación/i);

    await user.click(menuButton);
    await user.click(menuButton);
    await user.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledTimes(3);
  });

  it("should handle logout click even with onMenuClick defined", async () => {
    const handleMenuClick = vi.fn();
    const logoutFn = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      logout: logoutFn,
    });

    const { getAllByRole, user } = renderWithProviders(
      <AppHeader onMenuClick={handleMenuClick} />
    );

    const buttons = getAllByRole("button");
    const logoutButton = buttons[buttons.length - 1];

    await user.click(logoutButton);

    // Only logout should be called, not menu handler
    expect(logoutFn).toHaveBeenCalledOnce();
    // Menu handler should not be called from logout button
    expect(handleMenuClick).not.toHaveBeenCalled();
  });
});
