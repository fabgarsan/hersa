import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { ForgotPasswordForm } from "../ForgotPasswordForm";

// Mock the mutation
vi.mock("../../api/forgotPasswordMutation", () => ({
  useForgotPasswordMutation: vi.fn(),
}));

import { useForgotPasswordMutation } from "../../api/forgotPasswordMutation";

const createMockMutation = () => {
  let capturedOnSuccess: (() => void) | null = null;
  let capturedOnError: ((err: any) => void) | null = null;

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

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("render - initial state", () => {
    it("should render username/email input field", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      renderWithProviders(<ForgotPasswordForm />);

      expect(screen.getByLabelText(/Usuario o correo electrónico/i)).toBeInTheDocument();
    });

    it("should render submit button", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      renderWithProviders(<ForgotPasswordForm />);

      expect(screen.getByRole("button", { name: /Enviar enlace/i })).toBeInTheDocument();
    });

    it("should not show success alert initially", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      renderWithProviders(<ForgotPasswordForm />);

      expect(
        screen.queryByText(/Si existe una cuenta con esa información/i)
      ).not.toBeInTheDocument();
    });

    it("should not show error alert initially", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      renderWithProviders(<ForgotPasswordForm />);

      expect(screen.queryByText(/Algo salió mal/i)).not.toBeInTheDocument();
    });
  });

  describe("form submission validation", () => {
    it("should show validation error when usernameOrEmail is empty", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Ingresa tu usuario o correo electrónico.")).toBeInTheDocument();
      });
    });

    it("should not call mutate when validation fails", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).not.toHaveBeenCalled();
      });
    });
  });

  describe("successful submission", () => {
    it("should call mutate with valid username", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          { usernameOrEmail: "testuser" },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    it("should call mutate with valid email", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutation.mutate).toHaveBeenCalledWith(
          { usernameOrEmail: "test@example.com" },
          expect.any(Object),
        );
      });
    });

    it("should show success message on successful submission", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            /Si existe una cuenta con esa información, se ha enviado un enlace para restablecer la contraseña/i
          )
        ).toBeInTheDocument();
      });
    });

    it("should hide the form after successful submission", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        expect(screen.queryByLabelText(/Usuario o correo electrónico/i)).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Enviar enlace/i })).not.toBeInTheDocument();
      });
    });

    it("should display success alert when form is successfully submitted", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onSuccess = mockMutation.getOnSuccess();
        onSuccess?.();
      });

      await waitFor(() => {
        const successAlert = screen.getByText(
          /Si existe una cuenta con esa información, se ha enviado un enlace para restablecer la contraseña/i
        );
        expect(successAlert).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should show error message on API error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new Error("API Error");
        onError?.(error);
      });

      await waitFor(() => {
        expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
      });
    });

    it("should not show error message on network error", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const networkError = new Error("Network Error");
        (networkError as any).code = "ERR_NETWORK";
        onError?.(networkError);
      });

      // Network errors should be silently ignored
      expect(screen.queryByText(/Algo salió mal/i)).not.toBeInTheDocument();
    });

    it("should keep form visible if there is an error during submission", async () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue(mockMutation);

      const { user } = renderWithProviders(<ForgotPasswordForm />);

      const usernameField = screen.getByLabelText(/Usuario o correo electrónico/i);
      await user.type(usernameField, "testuser");

      const submitButton = screen.getByRole("button", { name: /Enviar enlace/i });
      await user.click(submitButton);

      await waitFor(() => {
        const onError = mockMutation.getOnError();
        const error = new Error("API Error");
        onError?.(error);
      });

      await waitFor(() => {
        // Form should still be visible so user can retry
        expect(screen.getByLabelText(/Usuario o correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Enviar enlace/i })).toBeInTheDocument();
      });
    });
  });

  describe("button state", () => {
    it("should disable button while mutation is pending", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      });

      renderWithProviders(<ForgotPasswordForm />);

      expect(screen.getByRole("button", { name: /Enviando/i })).toBeDisabled();
    });

    it("should show pending label while sending", () => {
      const mockMutation = createMockMutation();
      vi.mocked(useForgotPasswordMutation).mockReturnValue({
        ...mockMutation,
        isPending: true,
      });

      renderWithProviders(<ForgotPasswordForm />);

      expect(screen.getByRole("button", { name: /Enviando/i })).toBeInTheDocument();
    });
  });
});
