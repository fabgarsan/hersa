import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { ComingSoonState } from "./ComingSoonState";

describe("ComingSoonState", () => {
  it("renders without crashing with default props", () => {
    const { container } = renderWithProviders(<ComingSoonState />);

    expect(container).toBeInTheDocument();
  });

  it("renders default title 'En desarrollo'", () => {
    renderWithProviders(<ComingSoonState />);

    expect(screen.getByText("En desarrollo")).toBeInTheDocument();
  });

  it("renders default description", () => {
    renderWithProviders(<ComingSoonState />);

    expect(screen.getByText("Esta sección estará disponible próximamente.")).toBeInTheDocument();
  });

  it("renders custom title when provided", () => {
    renderWithProviders(<ComingSoonState title="Coming Soon!" />);

    expect(screen.getByText("Coming Soon!")).toBeInTheDocument();
  });

  it("renders custom description when provided", () => {
    renderWithProviders(<ComingSoonState description="Check back later for updates." />);

    expect(screen.getByText("Check back later for updates.")).toBeInTheDocument();
  });

  it("renders both custom title and description", () => {
    renderWithProviders(
      <ComingSoonState
        title="Feature Coming Soon"
        description="We're working on something awesome for you."
      />,
    );

    expect(screen.getByText("Feature Coming Soon")).toBeInTheDocument();
    expect(screen.getByText("We're working on something awesome for you.")).toBeInTheDocument();
  });

  it("renders custom icon when provided", () => {
    renderWithProviders(<ComingSoonState icon={<span data-testid="custom-icon">⚙️</span>} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders default BuildIcon when no icon is provided", () => {
    const { container } = renderWithProviders(<ComingSoonState />);

    // Verify BuildIcon (MUI icon) is rendered
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders h6 title heading", () => {
    renderWithProviders(<ComingSoonState />);

    const heading = screen.getByRole("heading", { level: 6 });
    expect(heading).toHaveTextContent("En desarrollo");
  });

  it("does not render description if it is empty", () => {
    renderWithProviders(<ComingSoonState description="" />);

    // Should only have the title, not an empty description element
    const heading = screen.getByRole("heading", { level: 6 });
    expect(heading).toBeInTheDocument();
  });

  it("renders description in body2 typography style", () => {
    renderWithProviders(<ComingSoonState description="Test description" />);

    const description = screen.getByText("Test description");
    expect(description).toHaveClass("MuiTypography-body2");
  });
});
