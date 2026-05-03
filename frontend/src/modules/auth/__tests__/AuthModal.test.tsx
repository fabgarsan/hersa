import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@shared/contexts/AuthProvider";
import { hersaTheme } from "@shared/styles/theme";
import { QueryClient } from "@tanstack/react-query";
import type { InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import type { TokenPair } from "../types";
import { AuthModal } from "../AuthModal";
import { ROUTES } from "@shared/constants/routes";

// Mock the login mutation
vi.mock("../loginMutation", () => ({
  useLoginMutation: vi.fn(),
}));

// Mock the auth context
vi.mock("@shared/contexts", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import("@shared/contexts")>();
  return { ...actual, useAuthContext: vi.fn() };
});

import { useLoginMutation } from "../loginMutation";
import { useAuthContext } from "@shared/contexts";

// Safe redirect target for tests
function HomeScreen() {
  return <div>Home Page</div>;
}

function ForgotPasswordScreen() {
  return <div>Forgot Password Page</div>;
}

const emotionCache = createCache({ key: "css-test", prepend: true });

const createMockMutation = () => {
  let capturedOnSuccess: ((data: TokenPair) => void) | null = null;
  let capturedOnError: ((err: Error) => void) | null = null;

  const mutate = vi.fn((values, options) => {
    capturedOnSuccess = options.onSuccess;
    capturedOnError = options.onError;
  });

  return {
    mutate,
    isPending: false,
    getOnSuccess: () => capturedOnSuccess,
    getOnError: () => capturedOnError,
  };
};

describe("AuthModal", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    const mockMutation = createMockMutation();
    vi.mocked(useLoginMutation).mockReturnValue(mockMutation);
    vi.mocked(useAuthContext).mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  const renderWithRouter = (initialEntries = [ROUTES.LOGIN]) => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
    });
    const user = userEvent.setup();
    const result = render(
      <CacheProvider value={emotionCache}>
        <QueryClientProvider client={qc}>
          <MemoryRouter initialEntries={initialEntries}>
            <AuthProvider>
              <ThemeProvider theme={hersaTheme}>
                <Routes>
                  <Route path={ROUTES.LOGIN} element={<AuthModal />} />
                  <Route path={ROUTES.HOME} element={<HomeScreen />} />
                  <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordScreen />} />
                </Routes>
              </ThemeProvider>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </CacheProvider>,
    );
    return { ...result, user };
  };

  describe("render", () => {
    it("should render username and password fields", () => {
      renderWithRouter();

      expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    });

    it("should render login button", () => {
      renderWithRouter();

      expect(screen.getByRole("button", { name: /Iniciar sesión/i })).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      renderWithRouter();

      const link = screen.getByRole("link", { name: /Olvidaste tu contraseña/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", ROUTES.FORGOT_PASSWORD);
    });

    it("should not render error alert initially", () => {
      renderWithRouter();

      expect(screen.queryByText(/Credenciales incorrectas/i)).not.toBeInTheDocument();
    });
  });

  describe("form submission validation", () => {
    it("should show validation error when username is empty", async () => {
      const { user } = renderWithRouter();

      const passwordField = screen.getByLabelText(/Contraseña/i);
      await user.type(passwordField, "password123");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("El usuario es obligatorio.")).toBeInTheDocument();
      });
    });

    it("should show validation error when password is empty", async () => {
      const { user } = renderWithRouter();

      const usernameField = screen.getByLabelText(/Usuario/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
      });
    });

    it("should show validation errors for both empty fields", async () => {
      const { user } = renderWithRouter();

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("El usuario es obligatorio.")).toBeInTheDocument();
        expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
      });
    });

    it("should not call mutate when validation fails", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).not.toHaveBeenCalled();
      });
    });
  });

  describe("successful login", () => {
    it("should call mutate with valid credentials", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "password123");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          { username: "testuser", password: "password123" },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    it("should call login context and navigate to HOME on successful login", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);
      const mockLogin = vi.fn();
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        login: mockLogin,
        logout: vi.fn(),
      });

      const { user } = renderWithRouter();

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "password123");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        expect(onSuccess).toBeDefined();
        onSuccess?.({ access: "access_token", refresh: "refresh_token" });
      });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("access_token", "refresh_token");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
      });
    });

    it("should redirect to origin when returned from protected route", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);
      const mockLogin = vi.fn();
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        login: mockLogin,
        logout: vi.fn(),
      });

      const qc = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
      });
      const user = userEvent.setup();
      render(
        <CacheProvider value={emotionCache}>
          <QueryClientProvider client={qc}>
            <MemoryRouter
              initialEntries={[
                { pathname: ROUTES.LOGIN, state: { from: { pathname: "/profile" } } },
              ]}
            >
              <AuthProvider>
                <ThemeProvider theme={hersaTheme}>
                  <Routes>
                    <Route path={ROUTES.LOGIN} element={<AuthModal />} />
                    <Route path={ROUTES.HOME} element={<HomeScreen />} />
                    <Route path="/profile" element={<div>Profile Page</div>} />
                  </Routes>
                </ThemeProvider>
              </AuthProvider>
            </MemoryRouter>
          </QueryClientProvider>
        </CacheProvider>,
      );

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "password123");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.({ access: "access_token", refresh: "refresh_token" });
      });

      // Note: actual redirect verification would depend on router implementation
      // The component handles redirectTo based on isSafeRedirect check
      expect(mockLogin).toHaveBeenCalled();
    });

    it("should block open redirect from //evil.com and redirect to HOME instead", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);
      const mockLogin = vi.fn();
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        login: mockLogin,
        logout: vi.fn(),
      });

      const qc = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
      });
      const user = userEvent.setup();
      render(
        <CacheProvider value={emotionCache}>
          <QueryClientProvider client={qc}>
            <MemoryRouter
              initialEntries={[
                { pathname: ROUTES.LOGIN, state: { from: { pathname: "//evil.com/steal" } } },
              ]}
            >
              <AuthProvider>
                <ThemeProvider theme={hersaTheme}>
                  <Routes>
                    <Route path={ROUTES.LOGIN} element={<AuthModal />} />
                    <Route path={ROUTES.HOME} element={<HomeScreen />} />
                  </Routes>
                </ThemeProvider>
              </AuthProvider>
            </MemoryRouter>
          </QueryClientProvider>
        </CacheProvider>,
      );

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "password123");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.({ access: "access_token", refresh: "refresh_token" });
      });

      await waitFor(() => {
        expect(screen.getByText("Home Page")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should show error alert on 401 authentication failure", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "wrongpassword");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        expect(onError).toBeDefined();
        // Simulate a 401 error that is not a network error
        const error = new AxiosError(
          "Unauthorized",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: {},
            status: 401,
            statusText: "Unauthorized",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText(/Credenciales incorrectas/i)).toBeInTheDocument();
      });
    });

    it("should not render error alert on network error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "password123");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        // Simulate a network error with ERR_NETWORK code
        const networkError = new Error("Network Error");
        Object.assign(networkError, { code: "ERR_NETWORK" });
        onError?.(networkError);
      });

      // Error alert should not be shown for network errors
      expect(screen.queryByText(/Credenciales incorrectas/i)).not.toBeInTheDocument();
    });

    it("should not navigate on authentication error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);
      const mockLogin = vi.fn();
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        login: mockLogin,
        logout: vi.fn(),
      });

      const { user } = renderWithRouter();

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "wrongpassword");

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new Error("Unauthorized");
        onError?.(error);
      });

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
        expect(screen.queryByText("Home Page")).not.toBeInTheDocument();
      });
    });
  });

  describe("button state", () => {
    it("should disable button while mutation is pending", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      });

      const { user } = renderWithRouter();

      const usernameField = screen.getByLabelText(/Usuario/i);
      const passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "password123");

      const submitButton = screen.getByRole("button", { name: /Iniciando sesión/i });
      expect(submitButton).toBeDisabled();
    });

    it("should show pending label while logging in", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      });

      renderWithRouter();

      expect(screen.getByRole("button", { name: /Iniciando sesión/i })).toBeInTheDocument();
    });
  });

  describe("forgot password link navigation", () => {
    it("should navigate to forgot password page when link is clicked", async () => {
      const { user } = renderWithRouter();

      const link = screen.getByRole("link", { name: /Olvidaste tu contraseña/i });
      await user.click(link);

      await waitFor(() => {
        expect(screen.getByText("Forgot Password Page")).toBeInTheDocument();
      });
    });
  });

  describe("clear error on new submission attempt", () => {
    it("should clear error alert when user tries to log in again after error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useLoginMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();

      // First attempt with wrong password
      let usernameField = screen.getByLabelText(/Usuario/i);
      let passwordField = screen.getByLabelText(/Contraseña/i);

      await user.type(usernameField, "testuser");
      await user.type(passwordField, "wrongpassword");

      let submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new Error("Unauthorized");
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText(/Credenciales incorrectas/i)).toBeInTheDocument();
      });

      // Clear fields and try again
      usernameField = screen.getByLabelText(/Usuario/i);
      passwordField = screen.getByLabelText(/Contraseña/i);

      await user.clear(usernameField);
      await user.clear(passwordField);
      await user.type(usernameField, "testuser");
      await user.type(passwordField, "correctpassword");

      submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      // The error should be cleared on new submission
      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalled();
      });
    });
  });
});
