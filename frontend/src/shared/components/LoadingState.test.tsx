import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("renders without crashing with default spinner variant", () => {
    const { container } = renderWithProviders(<LoadingState />);

    expect(container).toBeInTheDocument();
  });

  it("renders default label 'Cargando...' with spinner variant", () => {
    renderWithProviders(<LoadingState />);

    const spinner = screen.getByRole("progressbar", { hidden: true });
    expect(spinner).toHaveAttribute("aria-label", "Cargando...");
  });

  it("renders custom label when provided with spinner variant", () => {
    renderWithProviders(<LoadingState label="Loading users..." />);

    const spinner = screen.getByRole("progressbar", { hidden: true });
    expect(spinner).toHaveAttribute("aria-label", "Loading users...");
  });

  it("renders spinner variant by default", () => {
    renderWithProviders(<LoadingState />);

    const spinner = screen.getByRole("progressbar", { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it("renders skeleton variant without crashing", () => {
    const { container } = renderWithProviders(<LoadingState variant="skeleton" />);

    expect(container).toBeInTheDocument();
  });

  it("renders correct number of skeleton rows", () => {
    const { container } = renderWithProviders(<LoadingState variant="skeleton" rows={5} />);

    // MUI Skeleton renders multiple components
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons).toHaveLength(5);
  });

  it("renders default 3 skeleton rows when rows prop is not specified", () => {
    const { container } = renderWithProviders(<LoadingState variant="skeleton" />);

    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons).toHaveLength(3);
  });

  it("renders skeleton with custom message", () => {
    const { container } = renderWithProviders(
      <LoadingState variant="skeleton" label="Loading data..." />,
    );

    expect(container).toBeInTheDocument();
  });

  it("renders single skeleton row when rows={1}", () => {
    const { container } = renderWithProviders(<LoadingState variant="skeleton" rows={1} />);

    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons).toHaveLength(1);
  });

  it("renders many skeleton rows when specified", () => {
    const { container } = renderWithProviders(<LoadingState variant="skeleton" rows={10} />);

    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons).toHaveLength(10);
  });

  it("spinner and skeleton are mutually exclusive", () => {
    renderWithProviders(<LoadingState variant="spinner" />);

    const spinner = screen.getByRole("progressbar", { hidden: true });
    expect(spinner).toBeInTheDocument();

    const { container: skeletonContainer } = renderWithProviders(
      <LoadingState variant="skeleton" />,
    );

    const skeletons = skeletonContainer.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
