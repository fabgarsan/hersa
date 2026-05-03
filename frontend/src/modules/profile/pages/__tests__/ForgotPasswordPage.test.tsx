import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ForgotPasswordPage from "../ForgotPasswordPage";
import { ROUTES } from "@shared/constants/routes";

// Mock the ForgotPasswordForm component
vi.mock("../../features/password", () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-form">Forgot Password Form</div>,
}));

function LoginScreen() {
  return <div>Login Page</div>;
}

describe("ForgotPasswordPage", () => {
  const renderWithRouter = () => {
    const user = userEvent.setup();
    const result = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    return { ...result, user };
  };

  describe("render", () => {
    it("should render the forgot password form", () => {
      renderWithRouter();

      expect(screen.getByTestId("forgot-form")).toBeInTheDocument();
    });

    it("should display page title", () => {
      renderWithRouter();

      expect(screen.getByText("¿Olvidaste tu contraseña?")).toBeInTheDocument();
    });

    it("should display subtitle with instructions", () => {
      renderWithRouter();

      expect(
        screen.getByText(
          /Ingresa tu usuario o correo electrónico y te enviaremos un enlace para restablecer tu contraseña/i
        )
      ).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("should render back to login link", () => {
      renderWithRouter();

      const backLink = screen.getByRole("link", { name: /Volver al inicio de sesión/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", ROUTES.LOGIN);
    });

    it("should navigate to login when back link is clicked", async () => {
      const { user } = renderWithRouter();

      const backLink = screen.getByRole("link", { name: /Volver al inicio de sesión/i });
      await user.click(backLink);

      await waitFor(() => {
        expect(screen.getByText("Login Page")).toBeInTheDocument();
      });
    });
  });

  describe("layout structure", () => {
    it("should render form within AuthPageCard", () => {
      renderWithRouter();

      expect(screen.getByTestId("forgot-form")).toBeInTheDocument();
      // AuthPageCard should contain the title
      expect(screen.getByText("¿Olvidaste tu contraseña?")).toBeInTheDocument();
    });
  });
});
