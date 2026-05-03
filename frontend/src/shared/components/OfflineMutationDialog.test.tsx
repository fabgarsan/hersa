import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { OfflineMutationDialog } from "./OfflineMutationDialog";

describe("OfflineMutationDialog", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderDialog(open = true) {
    return renderWithProviders(<OfflineMutationDialog open={open} onClose={onClose} />);
  }

  it("should not render when open={false}", () => {
    const { queryByRole, queryByText } = renderDialog(false);
    expect(queryByRole("dialog")).not.toBeInTheDocument();
    expect(queryByText("El cambio no se guardó")).not.toBeInTheDocument();
  });

  it("should render when open={true}", () => {
    expect(renderDialog().getByRole("dialog")).toBeInTheDocument();
  });

  it("should render dialog title", () => {
    expect(renderDialog().getByText("El cambio no se guardó")).toBeInTheDocument();
  });

  it("should render dialog message", () => {
    expect(
      renderDialog().getByText(
        "No hay conexión en este momento. Los datos no fueron enviados. Cuando recuperes la señal, intenta guardar de nuevo.",
      ),
    ).toBeInTheDocument();
  });

  it("should have close/dismiss button", () => {
    expect(renderDialog().getByRole("button", { name: /entendido/i })).toBeInTheDocument();
  });

  it("should call onClose when button is clicked", async () => {
    const { getByRole, user } = renderDialog();
    await user.click(getByRole("button", { name: /entendido/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should render WifiOffIcon", () => {
    // Dialog renders in a MUI portal outside `container` — query from the dialog element itself.
    const { getByRole } = renderDialog();
    expect(getByRole("dialog").querySelector("[class*='wifiIcon']")).toBeInTheDocument();
  });

  it("should have disableEscapeKeyDown set", async () => {
    const { getByRole, user } = renderDialog();
    await user.keyboard("{Escape}");
    expect(getByRole("dialog")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should have proper aria-labelledby for accessibility", () => {
    expect(renderDialog().getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      "offline-mutation-dialog-title",
    );
  });

  it("should button be large size for touch targets", () => {
    expect(renderDialog().getByRole("button", { name: /entendido/i })).toHaveClass(
      "MuiButton-sizeLarge",
    );
  });

  it("should render button with autoFocus", () => {
    expect(renderDialog().getByRole("button", { name: /entendido/i })).toHaveFocus();
  });

  it("should render button as fullWidth", () => {
    expect(renderDialog().getByRole("button", { name: /entendido/i })).toHaveClass(
      "MuiButton-fullWidth",
    );
  });

  it("should render button as contained primary", () => {
    expect(renderDialog().getByRole("button", { name: /entendido/i })).toHaveClass(
      "MuiButton-containedPrimary",
    );
  });
});
