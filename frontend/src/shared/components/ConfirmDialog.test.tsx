import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("should not render when open={false}", () => {
    const { queryByRole } = renderWithProviders(
      <ConfirmDialog
        open={false}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render title and message when open={true}", () => {
    const { getByText } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(getByText("Delete Item?")).toBeInTheDocument();
    expect(getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const { getByRole, user } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmButton = getByRole("button", { name: /confirmar/i });
    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledOnce();
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const { getByRole, user } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const cancelButton = getByRole("button", { name: /cancelar/i });
    await user.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledOnce();
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("should disable both buttons when loading={true}", () => {
    const { getAllByRole } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={true}
      />
    );

    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should render custom confirmLabel and cancelLabel", () => {
    const { getByRole } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
      />
    );

    expect(getByRole("button", { name: /yes, delete/i })).toBeInTheDocument();
    expect(getByRole("button", { name: /keep it/i })).toBeInTheDocument();
  });

  it("should render spinner icon when loading={true}", () => {
    const { container, getAllByRole } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={true}
      />
    );

    // When loading, the confirm button contains a CircularProgress component
    const buttons = getAllByRole("button");
    const confirmButton = buttons[1]; // Second button is the confirm button
    const spinner = confirmButton.querySelector("svg[class*='MuiCircularProgress']");
    expect(spinner).toBeInTheDocument();
  });

  it("should apply error color when severity='error'", () => {
    const { getByRole } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        severity="error"
      />
    );

    const confirmButton = getByRole("button", { name: /confirmar/i });
    expect(confirmButton).toHaveClass("MuiButton-colorError");
  });

  it("should apply warning color by default", () => {
    const { getByRole } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const confirmButton = getByRole("button", { name: /confirmar/i });
    expect(confirmButton).toHaveClass("MuiButton-colorWarning");
  });

  it("should apply primary color when severity='info'", () => {
    const { getByRole } = renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        severity="info"
      />
    );

    const confirmButton = getByRole("button", { name: /confirmar/i });
    expect(confirmButton).toHaveClass("MuiButton-colorPrimary");
  });
});
