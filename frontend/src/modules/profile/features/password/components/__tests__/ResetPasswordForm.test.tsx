import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { ResetPasswordForm } from "../ResetPasswordForm";
import { ROUTES } from "@shared/constants/routes";

// Mock the mutation
vi.mock("../../api/resetPasswordMutation", () => ({
  useResetPasswordMutation: vi.fn(),
}));

import { useResetPasswordMutation } from "../../api/resetPasswordMutation";

const createMockMutation = () => {
  let capturedOnSuccess: (() => void) | null = null;
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

function HomeScreen() {
  return <div>Home Page</div>;
}

// Helper to get password fields
function getPasswordFields() {
  return {
    newPassword: screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i)[0],
    confirmPassword: screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i)[1],
  };
}

describe("ResetPasswordForm", () => {
  const defaultProps = {
    uid: "test-uid-123",
    token: "test-token-abc",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = () => {
    const user = userEvent.setup();
    const result = render(
      <MemoryRouter initialEntries={["/reset"]}>
        <Routes>
          <Route path="/reset" element={<ResetPasswordForm {...defaultProps} />} />
          <Route path={ROUTES.HOME} element={<HomeScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    return { ...result, user };
  };

  describe("render - initial state", () => {
    it("should render new password and confirm password fields", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      renderWithRouter();

      const fields = screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i);
      expect(fields.length).toBe(2);
    });

    it("should render submit button", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      renderWithRouter();

      expect(screen.getByRole("button", { name: /Restablecer contraseña/i })).toBeInTheDocument();
    });

    it("should not render success state initially", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      renderWithRouter();

      expect(screen.queryByText(/Tu contraseña ha sido restablecida/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Ir al inicio de sesión/i }),
      ).not.toBeInTheDocument();
    });

    it("should not show error message initially", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      renderWithRouter();

      expect(screen.queryByText(/Enlace inválido o expirado/i)).not.toBeInTheDocument();
    });
  });

  describe("form submission validation", () => {
    it("should show validation error when passwords do not match", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "DifferentPass456");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
      });
    });

    it("should show validation error when new password is less than 8 characters", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "Pass12");
      await user.type(confirmPassword, "Pass12");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("La contraseña debe tener al menos 8 caracteres."),
        ).toBeInTheDocument();
      });
    });

    it("should show validation error when new password is only numeric", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "12345678");
      await user.type(confirmPassword, "12345678");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("La contraseña no puede ser completamente numérica."),
        ).toBeInTheDocument();
      });
    });

    it("should reject empty confirm password", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Confirma tu nueva contraseña.")).toBeInTheDocument();
      });
    });

    it("should not call mutate when validation fails", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).not.toHaveBeenCalled();
      });
    });
  });

  describe("successful submission", () => {
    it("should call mutate with valid form data including uid and token", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          {
            newPassword: "NewPass123",
            confirmPassword: "NewPass123",
            uid: "test-uid-123",
            token: "test-token-abc",
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    it("should show success alert on successful reset", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Tu contraseña ha sido restablecida exitosamente/i),
        ).toBeInTheDocument();
      });
    });

    it("should display go to login button on success", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Ir al inicio de sesión/i })).toBeInTheDocument();
      });
    });

    it("should navigate to HOME when go to login button is clicked", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      const goToLoginButton = screen.getByRole("button", { name: /Ir al inicio de sesión/i });
      await user.click(goToLoginButton);

      await waitFor(() => {
        expect(screen.getByText("Home Page")).toBeInTheDocument();
      });
    });

    it("should hide form after successful reset", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        const fields = screen.queryAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i);
        expect(fields.length).toBe(0);
      });
    });
  });

  describe("error handling - API errors", () => {
    it("should set field error when API returns confirmPassword error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { confirmPassword: "Los tokens no coinciden." },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText("Los tokens no coinciden.")).toBeInTheDocument();
      });
    });

    it("should set field error when API returns newPassword string error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { newPassword: "La contraseña es muy débil." },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText("La contraseña es muy débil.")).toBeInTheDocument();
      });
    });

    it("should take first element when API returns newPassword array error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { newPassword: ["First error", "Second error"] },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText("First error")).toBeInTheDocument();
        expect(screen.queryByText("Second error")).not.toBeInTheDocument();
      });
    });

    it("should show detail message when API returns detail field in error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { detail: "El enlace de restablecimiento ha expirado." },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText("El enlace de restablecimiento ha expirado.")).toBeInTheDocument();
      });
    });

    it("should show request new link when detail error is shown", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { detail: "El enlace ha expirado." },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /Solicitar un nuevo enlace/i }),
        ).toBeInTheDocument();
      });
    });

    it("should show default error message when response has no detail field", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { someOtherField: "Some error" },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText(/Enlace inválido o expirado/i)).toBeInTheDocument();
      });
    });

    it("should not show error message on network error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const networkError = new Error("Network Error");
        Object.assign(networkError, { code: "ERR_NETWORK" });
        onError?.(networkError);
      });

      // Network errors should be silently ignored
      expect(screen.queryByText(/Enlace inválido/i)).not.toBeInTheDocument();
    });

    it("should keep form visible if there is an error during submission", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithRouter();
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Restablecer contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { detail: "Error occurred." },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        // Form should still be visible so user can retry
        const fields = screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i);
        expect(fields.length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: /Restablecer contraseña/i })).toBeInTheDocument();
      });
    });
  });

  describe("button state", () => {
    it("should disable button while mutation is pending", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      });

      renderWithRouter();

      expect(screen.getByRole("button", { name: /Restableciendo/i })).toBeDisabled();
    });

    it("should show pending label while resetting", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useResetPasswordMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      });

      renderWithRouter();

      expect(screen.getByRole("button", { name: /Restableciendo/i })).toBeInTheDocument();
    });
  });
});
