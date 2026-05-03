import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResetPasswordPage from "../ResetPasswordPage";
import { ROUTES } from "@shared/constants/routes";

// Mock the ResetPasswordForm component
vi.mock("../../features/password", () => ({
  ResetPasswordForm: ({ uid, token }: { uid: string; token: string }) => (
    <div data-testid="reset-form">
      Form with uid={uid} and token={token}
    </div>
  ),
}));

function ForgotPasswordScreen() {
  return <div>Forgot Password Page</div>;
}

function LoginScreen() {
  return <div>Login Page</div>;
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (searchParams = "") => {
    const path = searchParams ? `/reset-password?${searchParams}` : "/reset-password";
    const user = userEvent.setup();
    const result = render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordScreen />} />
          <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    return { ...result, user };
  };

  describe("render with valid parameters", () => {
    it("should render ResetPasswordForm when both uid and token are present", () => {
      renderWithRouter("uid=abc123&token=xyz789");

      expect(screen.getByTestId("reset-form")).toBeInTheDocument();
    });

    it("should pass uid and token props to ResetPasswordForm", () => {
      renderWithRouter("uid=user-id-123&token=reset-token-456");

      const form = screen.getByTestId("reset-form");
      expect(form).toHaveTextContent("uid=user-id-123");
      expect(form).toHaveTextContent("token=reset-token-456");
    });
  });

  describe("render without valid parameters", () => {
    it("should show invalid link message when uid is missing", () => {
      renderWithRouter("token=xyz789");

      expect(screen.getByText(/El enlace de restablecimiento es inválido o ha expirado/i)).toBeInTheDocument();
      expect(screen.queryByTestId("reset-form")).not.toBeInTheDocument();
    });

    it("should show invalid link message when token is missing", () => {
      renderWithRouter("uid=abc123");

      expect(screen.getByText(/El enlace de restablecimiento es inválido o ha expirado/i)).toBeInTheDocument();
      expect(screen.queryByTestId("reset-form")).not.toBeInTheDocument();
    });

    it("should show invalid link message when both uid and token are missing", () => {
      renderWithRouter("");

      expect(screen.getByText(/El enlace de restablecimiento es inválido o ha expirado/i)).toBeInTheDocument();
      expect(screen.queryByTestId("reset-form")).not.toBeInTheDocument();
    });

    it("should show invalid link message when uid is empty string", () => {
      renderWithRouter("uid=&token=xyz789");

      expect(screen.getByText(/El enlace de restablecimiento es inválido o ha expirado/i)).toBeInTheDocument();
      expect(screen.queryByTestId("reset-form")).not.toBeInTheDocument();
    });

    it("should show invalid link message when token is empty string", () => {
      renderWithRouter("uid=abc123&token=");

      expect(screen.getByText(/El enlace de restablecimiento es inválido o ha expirado/i)).toBeInTheDocument();
      expect(screen.queryByTestId("reset-form")).not.toBeInTheDocument();
    });
  });

  describe("navigation links", () => {
    it("should render back to login link when parameters are valid", () => {
      renderWithRouter("uid=abc123&token=xyz789");

      const backLink = screen.getByRole("link", { name: /Volver al inicio de sesión/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", ROUTES.LOGIN);
    });

    it("should render request new link when parameters are invalid", () => {
      renderWithRouter("");

      const newLinkButton = screen.getByRole("link", { name: /Solicitar un nuevo enlace/i });
      expect(newLinkButton).toBeInTheDocument();
      expect(newLinkButton).toHaveAttribute("href", ROUTES.FORGOT_PASSWORD);
    });

    it("should navigate to forgot password when request new link is clicked", async () => {
      const { user } = renderWithRouter("");

      const newLinkButton = screen.getByRole("link", { name: /Solicitar un nuevo enlace/i });
      await user.click(newLinkButton);

      await waitFor(() => {
        expect(screen.getByText("Forgot Password Page")).toBeInTheDocument();
      });
    });

    it("should navigate to login when back link is clicked with valid params", async () => {
      const { user } = renderWithRouter("uid=abc123&token=xyz789");

      const backLink = screen.getByRole("link", { name: /Volver al inicio de sesión/i });
      await user.click(backLink);

      await waitFor(() => {
        expect(screen.getByText("Login Page")).toBeInTheDocument();
      });
    });
  });

  describe("URL history cleaning", () => {
    it("should strip sensitive parameters from URL history on mount", () => {
      const replaceStateSpy = vi.spyOn(window.history, "replaceState");

      renderWithRouter("uid=abc123&token=xyz789");

      expect(replaceStateSpy).toHaveBeenCalledWith(null, "", window.location.pathname);

      replaceStateSpy.mockRestore();
    });

    it("should not strip URL when parameters are invalid", () => {
      const replaceStateSpy = vi.spyOn(window.history, "replaceState");

      renderWithRouter("");

      // Should not be called when uid or token are missing
      expect(replaceStateSpy).not.toHaveBeenCalled();

      replaceStateSpy.mockRestore();
    });
  });

  describe("page title", () => {
    it("should display page title in card header", () => {
      renderWithRouter("uid=abc123&token=xyz789");

      expect(screen.getByText("Restablecer contraseña")).toBeInTheDocument();
    });

    it("should display title even when parameters are invalid", () => {
      renderWithRouter("");

      expect(screen.getByText("Restablecer contraseña")).toBeInTheDocument();
    });
  });
});
