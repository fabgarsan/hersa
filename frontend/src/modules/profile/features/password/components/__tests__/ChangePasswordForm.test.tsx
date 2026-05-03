import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { renderWithProviders } from "@/tests/utils";
import { ChangePasswordForm } from "../ChangePasswordForm";

// Mock the mutation
vi.mock("../../api/changePasswordMutation", () => ({
  useChangePasswordMutation: vi.fn(),
}));

import { useChangePasswordMutation } from "../../api/changePasswordMutation";

const createMockMutation = () => {
  let capturedOnSuccess: (() => void) | null = null;
  let capturedOnError: ((err: Error) => void) | null = null;

  const mutate = vi.fn((_values, options) => {
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

// Helper to get password fields when there are multiple with same label
function getPasswordFields() {
  return {
    currentPassword: screen.getByLabelText(/Contraseña actual/i),
    newPassword: screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i)[0],
    confirmPassword: screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i)[1],
  };
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("render", () => {
    it("should render three password input fields", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      renderWithProviders(<ChangePasswordForm />);

      expect(screen.getByLabelText(/Contraseña actual/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i).length).toBe(
        2,
      );
    });

    it("should render submit button", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      renderWithProviders(<ChangePasswordForm />);

      expect(screen.getByRole("button", { name: /Cambiar contraseña/i })).toBeInTheDocument();
    });

    it("should not render any error or success messages initially", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      renderWithProviders(<ChangePasswordForm />);

      expect(screen.queryByText(/Contraseña cambiada exitosamente/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error al cambiar/i)).not.toBeInTheDocument();
    });
  });

  describe("form submission validation", () => {
    it("should show validation error when current password is empty", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("La contraseña actual es obligatoria.")).toBeInTheDocument();
      });
    });

    it("should show validation error when new password is empty", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(confirmPassword, "NewPass123");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("La nueva contraseña es obligatoria.")).toBeInTheDocument();
      });
    });

    it("should show validation error when new password is less than 8 characters", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "Short1");
      await user.type(confirmPassword, "Short1");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("La contraseña debe tener al menos 8 caracteres."),
        ).toBeInTheDocument();
      });
    });

    it("should show validation error when new password is only numeric", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "12345678");
      await user.type(confirmPassword, "12345678");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("La contraseña no puede ser completamente numérica."),
        ).toBeInTheDocument();
      });
    });

    it("should show validation error when passwords do not match", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass123");
      await user.type(confirmPassword, "DifferentPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
      });
    });

    it("should not call mutate when validation fails", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).not.toHaveBeenCalled();
      });
    });
  });

  describe("successful submission", () => {
    it("should call mutate with valid form data", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          {
            currentPassword: "OldPass123",
            newPassword: "NewPass456",
            confirmPassword: "NewPass456",
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    it("should show success message on successful change", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        expect(screen.getByText("Contraseña cambiada exitosamente.")).toBeInTheDocument();
      });
    });

    it("should reset form after successful change", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        expect((screen.getByLabelText(/Contraseña actual/i) as HTMLInputElement).value).toBe("");
        const allFields = screen.getAllByLabelText(/Nueva contraseña|Confirmar nueva contraseña/i);
        expect((allFields[0] as HTMLInputElement).value).toBe("");
        expect((allFields[1] as HTMLInputElement).value).toBe("");
      });
    });

    it("should call onSuccess callback when password is changed successfully", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );
      const onSuccess = vi.fn();

      const { user } = renderWithProviders(<ChangePasswordForm onSuccess={onSuccess} />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const mutationOnSuccess = mockMutation.getOnSuccess();
        mutationOnSuccess?.();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("error handling - API errors", () => {
    it("should set field error when API returns currentPassword error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "WrongPass");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { currentPassword: "La contraseña actual es incorrecta." },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText("La contraseña actual es incorrecta.")).toBeInTheDocument();
      });
    });

    it("should set field error when API returns newPassword string error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: { newPassword: "La contraseña es común." },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText("La contraseña es común.")).toBeInTheDocument();
      });
    });

    it("should set field error when API returns newPassword array error (take first element)", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
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
      });
    });

    it("should show generic error message when API returns unknown error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
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
        expect(screen.getByText(/Error al cambiar la contraseña/i)).toBeInTheDocument();
      });
    });

    it("should not show error message on network error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);

      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const networkError = new Error("Network Error");
        Object.assign(networkError, { code: "ERR_NETWORK" });
        onError?.(networkError);
      });

      // Network errors should be silently ignored (handled globally)
      expect(screen.queryByText(/Error al cambiar/i)).not.toBeInTheDocument();
    });
  });

  describe("button state", () => {
    it("should disable button while mutation is pending", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      } as unknown as ReturnType<typeof useChangePasswordMutation>);

      renderWithProviders(<ChangePasswordForm />);

      expect(screen.getByRole("button", { name: /Guardando/i })).toBeDisabled();
    });

    it("should show pending label while saving", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      } as unknown as ReturnType<typeof useChangePasswordMutation>);

      renderWithProviders(<ChangePasswordForm />);

      expect(screen.getByRole("button", { name: /Guardando/i })).toBeInTheDocument();
    });
  });

  describe("security - password field protection", () => {
    it("should not allow XSS payload in password fields", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);
      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();
      const xssPayload = '<script>alert("xss")</script>';

      await user.type(currentPassword, xssPayload);
      await user.type(newPassword, xssPayload);
      await user.type(confirmPassword, xssPayload);

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            currentPassword: xssPayload,
            newPassword: xssPayload,
            confirmPassword: xssPayload,
          }),
          expect.any(Object),
        );
      });

      // XSS payload should not be executed
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should sanitize currentPassword error messages from API", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);
      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "WrongPass");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: {
              currentPassword: "<img src=x onerror=\"alert('xss')\">Contraseña incorrecta",
            },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      // Error message should be displayed as text, not HTML
      const errorText = screen.getByText(
        "<img src=x onerror=\"alert('xss')\">Contraseña incorrecta",
      );
      expect(errorText).toBeInTheDocument();
      expect(document.querySelector("img[onerror]")).not.toBeInTheDocument();
    });

    it("should sanitize success message alert", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);
      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      // Success alert should contain only text content
      const successAlert = screen.getByText("Contraseña cambiada exitosamente.");
      expect(successAlert.innerHTML).not.toContain("<script");
      expect(successAlert.innerHTML).not.toContain("<img");
      expect(successAlert.innerHTML).not.toContain("onerror");
    });

    it("should not execute HTML in error alert messages", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);
      const { currentPassword, newPassword, confirmPassword } = getPasswordFields();

      await user.type(currentPassword, "OldPass123");
      await user.type(newPassword, "NewPass456");
      await user.type(confirmPassword, "NewPass456");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new AxiosError(
          "API Error",
          "ERR_BAD_RESPONSE",
          { headers: {} } as InternalAxiosRequestConfig,
          undefined,
          {
            data: {
              someOtherField: "<div onclick=\"alert('xss')\">Error</div>",
            },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: { headers: {} } as InternalAxiosRequestConfig,
          },
        );
        onError?.(error);
      });

      // Generic error should be displayed without executing HTML
      expect(screen.getByText(/Error al cambiar la contraseña/i)).toBeInTheDocument();
      expect(document.querySelector("div[onclick]")).not.toBeInTheDocument();
    });

    it("should not display raw HTML tags in form error helper texts", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useChangePasswordMutation).mockReturnValue(
        mockMutation as unknown as ReturnType<typeof useChangePasswordMutation>,
      );

      const { user } = renderWithProviders(<ChangePasswordForm />);
      const { newPassword, confirmPassword } = getPasswordFields();

      await user.type(newPassword, "Short1");
      await user.type(confirmPassword, "Short1");

      const submitButton = screen.getByRole("button", { name: /Cambiar contraseña/i });
      await user.click(submitButton);

      await waitFor(() => {
        const validationError = screen.getByText("La contraseña debe tener al menos 8 caracteres.");
        // Validation error should be text content, not HTML
        expect(validationError.innerHTML).not.toContain("<");
      });
    });
  });
});
