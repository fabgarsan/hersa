import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders default title when not provided", () => {
    renderWithProviders(<ErrorState />);

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
  });

  it("renders default description when not provided", () => {
    renderWithProviders(<ErrorState />);

    expect(screen.getByText("Ocurrió un error inesperado. Intentá de nuevo.")).toBeInTheDocument();
  });

  it("renders custom title when provided", () => {
    renderWithProviders(<ErrorState title="Custom Error Title" />);

    expect(screen.getByText("Custom Error Title")).toBeInTheDocument();
  });

  it("renders custom description when provided", () => {
    renderWithProviders(<ErrorState description="Custom error description" />);

    expect(screen.getByText("Custom error description")).toBeInTheDocument();
  });

  it("renders both custom title and description", () => {
    renderWithProviders(
      <ErrorState title="Oops!" description="Something went wrong with the request." />,
    );

    expect(screen.getByText("Oops!")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong with the request.")).toBeInTheDocument();
  });

  it("renders 'Reintentar' button when onRetry callback is provided", () => {
    const mockRetry = vi.fn();
    renderWithProviders(<ErrorState onRetry={mockRetry} />);

    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("calls onRetry callback when retry button is clicked", async () => {
    const mockRetry = vi.fn();
    const { user } = renderWithProviders(<ErrorState onRetry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    await user.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is not provided", () => {
    renderWithProviders(<ErrorState />);

    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it("renders error icon", () => {
    const { container } = renderWithProviders(<ErrorState />);

    // Verify ErrorOutlineIcon (MUI icon) is rendered
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders with multiple retry attempts", async () => {
    const mockRetry = vi.fn();
    const { user } = renderWithProviders(<ErrorState onRetry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: /reintentar/i });
    await user.click(retryButton);
    await user.click(retryButton);
    await user.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(3);
  });
});
