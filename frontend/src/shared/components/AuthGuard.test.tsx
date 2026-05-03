import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";

vi.mock("@shared/contexts", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import("@shared/contexts")>();
  return { ...actual, useAuthContext: vi.fn() };
});

import { useAuthContext } from "@shared/contexts";

const MOCK_AUTH_BASE = { login: vi.fn(), logout: vi.fn() };

// Renders the current pathname so redirect tests can assert the navigation target
function LocationSpy() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

describe("AuthGuard", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders children when authenticated on a protected route", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      ...MOCK_AUTH_BASE,
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /login when unauthenticated on a protected route", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      ...MOCK_AUTH_BASE,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <AuthGuard>
                <div>Protected Content</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<LocationSpy />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location").textContent).toBe("/login");
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("does not render children while auth is loading", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      ...MOCK_AUTH_BASE,
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects authenticated user away from a public route", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      ...MOCK_AUTH_BASE,
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthGuard>
                <div>Login Form</div>
              </AuthGuard>
            }
          />
          <Route path="/" element={<LocationSpy />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("location").textContent).toBe("/");
    expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
  });

  it("blocks open redirect from //evil.com and falls back to /", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      ...MOCK_AUTH_BASE,
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/login", state: { from: { pathname: "//evil.com/steal" } } }]}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <AuthGuard>
                <div>Login Form</div>
              </AuthGuard>
            }
          />
          <Route path="/" element={<div data-testid="safe-home">Safe Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("safe-home")).toBeInTheDocument();
    expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
  });
});
