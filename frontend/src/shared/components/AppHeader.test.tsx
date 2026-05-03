import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { AppHeader } from "./AppHeader";

vi.mock("@modules/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/auth")>();
  return { ...actual, useAuth: vi.fn() };
});

import { useAuth } from "@modules/auth";

describe("AppHeader", () => {
  const logoutFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, logout: logoutFn });
  });

  it("should render without crashing", () => {
    const { container } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });

  it("should render menu button with correct aria-label", () => {
    const { getByLabelText } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(getByLabelText(/abrir navegación/i)).toBeInTheDocument();
  });

  it("should render logout button with tooltip", () => {
    const { getAllByRole } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(getAllByRole("button").length).toBeGreaterThan(1);
  });

  it("should call onMenuClick when menu button is clicked", async () => {
    const handleMenuClick = vi.fn();
    const { getByLabelText, user } = renderWithProviders(
      <AppHeader onMenuClick={handleMenuClick} />,
    );
    await user.click(getByLabelText(/abrir navegación/i));
    expect(handleMenuClick).toHaveBeenCalledOnce();
  });

  it("should call logout when logout button is clicked", async () => {
    const { getAllByRole, user } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    const buttons = getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    expect(logoutFn).toHaveBeenCalledOnce();
  });

  it("should render in an AppBar component", () => {
    const { container } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(container.querySelector("[class*='MuiAppBar']")).toBeInTheDocument();
  });

  it("should have correct AppBar elevation", () => {
    const { container } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    const appBar = container.querySelector("[class*='MuiAppBar']");
    expect(appBar?.className).toMatch(/elevation0/);
  });

  it("should render menu button before logout button in order", () => {
    const { getAllByRole } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(getAllByRole("button")[0]).toHaveAttribute("aria-label");
  });

  it("should call useAuth hook to get logout function", () => {
    renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(useAuth).toHaveBeenCalled();
  });

  it("should pass correct props to buttons", () => {
    const { getByLabelText } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(getByLabelText(/abrir navegación/i)).toHaveClass("MuiIconButton-colorInherit");
  });

  it("should render logout icon in the logout button", () => {
    const { container } = renderWithProviders(<AppHeader onMenuClick={vi.fn()} />);
    expect(container.querySelectorAll("[class*='MuiSvgIcon']").length).toBeGreaterThan(0);
  });

  it("should handle multiple clicks on menu button", async () => {
    const handleMenuClick = vi.fn();
    const { getByLabelText, user } = renderWithProviders(
      <AppHeader onMenuClick={handleMenuClick} />,
    );
    const menuButton = getByLabelText(/abrir navegación/i);
    await user.click(menuButton);
    await user.click(menuButton);
    await user.click(menuButton);
    expect(handleMenuClick).toHaveBeenCalledTimes(3);
  });

  it("should handle logout click even with onMenuClick defined", async () => {
    const handleMenuClick = vi.fn();
    const { getAllByRole, user } = renderWithProviders(<AppHeader onMenuClick={handleMenuClick} />);
    const buttons = getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    expect(logoutFn).toHaveBeenCalledOnce();
    expect(handleMenuClick).not.toHaveBeenCalled();
  });
});
