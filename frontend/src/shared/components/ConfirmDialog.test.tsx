import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderDialog(overrides: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
    return renderWithProviders(
      <ConfirmDialog
        open={true}
        title="Delete Item?"
        message="This action cannot be undone."
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...overrides}
      />,
    );
  }

  it("should not render when open={false}", () => {
    const { queryByRole } = renderDialog({ open: false });
    expect(queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render title and message when open={true}", () => {
    const { getByText } = renderDialog();
    expect(getByText("Delete Item?")).toBeInTheDocument();
    expect(getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const { getByRole, user } = renderDialog();
    await user.click(getByRole("button", { name: /confirmar/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const { getByRole, user } = renderDialog();
    await user.click(getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should disable both buttons when loading={true}", () => {
    const { getAllByRole } = renderDialog({ loading: true });
    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should render custom confirmLabel and cancelLabel", () => {
    const { getByRole } = renderDialog({ confirmLabel: "Yes, delete", cancelLabel: "Keep it" });
    expect(getByRole("button", { name: /yes, delete/i })).toBeInTheDocument();
    expect(getByRole("button", { name: /keep it/i })).toBeInTheDocument();
  });

  it("should render spinner icon when loading={true}", () => {
    const { getByRole } = renderDialog({ loading: true });
    const confirmButton = getByRole("button", { name: /confirmar/i });
    expect(confirmButton.querySelector("svg[class*='MuiCircularProgress']")).toBeInTheDocument();
  });

  it("should apply error color when severity='error'", () => {
    const { getByRole } = renderDialog({ severity: "error" });
    expect(getByRole("button", { name: /confirmar/i })).toHaveClass("MuiButton-colorError");
  });

  it("should apply warning color by default", () => {
    const { getByRole } = renderDialog();
    expect(getByRole("button", { name: /confirmar/i })).toHaveClass("MuiButton-colorWarning");
  });

  it("should apply primary color when severity='info'", () => {
    const { getByRole } = renderDialog({ severity: "info" });
    expect(getByRole("button", { name: /confirmar/i })).toHaveClass("MuiButton-colorPrimary");
  });
});
