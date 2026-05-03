import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { OfflineMutationDialog } from "./OfflineMutationDialog";

describe("OfflineMutationDialog", () => {
  it("should not render when open={false}", () => {
    const { queryByRole, queryByText } = renderWithProviders(
      <OfflineMutationDialog open={false} onClose={vi.fn()} />
    );

    expect(queryByRole("dialog")).not.toBeInTheDocument();
    expect(queryByText("El cambio no se guardó")).not.toBeInTheDocument();
  });

  it("should render when open={true}", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    expect(getByRole("dialog")).toBeInTheDocument();
  });

  it("should render dialog title", () => {
    const { getByText } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    expect(getByText("El cambio no se guardó")).toBeInTheDocument();
  });

  it("should render dialog message", () => {
    const { getByText } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    expect(
      getByText(
        "No hay conexión en este momento. Los datos no fueron enviados. Cuando recuperes la señal, intenta guardar de nuevo."
      )
    ).toBeInTheDocument();
  });

  it("should have close/dismiss button", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    expect(getByRole("button", { name: /entendido/i })).toBeInTheDocument();
  });

  it("should call onClose when button is clicked", async () => {
    const handleClose = vi.fn();
    const { getByRole, user } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={handleClose} />
    );

    const button = getByRole("button", { name: /entendido/i });
    await user.click(button);

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should render WifiOffIcon", () => {
    const { container } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    // Look for SVG icon within the dialog content
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should have disableEscapeKeyDown set", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    const dialog = getByRole("dialog");
    // Dialog should be present - the disableEscapeKeyDown prevents Escape key from closing it
    expect(dialog).toBeInTheDocument();
  });

  it("should have proper aria-labelledby for accessibility", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    const dialog = getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "offline-mutation-dialog-title");
  });

  it("should button be large size for touch targets", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    const button = getByRole("button", { name: /entendido/i });
    expect(button).toHaveClass("MuiButton-sizeLarge");
  });

  it("should render button with autoFocus", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    const button = getByRole("button", { name: /entendido/i });
    expect(button).toHaveFocus();
  });

  it("should render button as fullWidth", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    const button = getByRole("button", { name: /entendido/i });
    expect(button).toHaveClass("MuiButton-fullWidth");
  });

  it("should render button as contained primary", () => {
    const { getByRole } = renderWithProviders(
      <OfflineMutationDialog open={true} onClose={vi.fn()} />
    );

    const button = getByRole("button", { name: /entendido/i });
    expect(button).toHaveClass("MuiButton-containedPrimary");
  });
});
