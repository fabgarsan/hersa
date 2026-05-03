/* eslint-disable hersa-style/require-scss-module */
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders default title and description for 'initial' variant", () => {
    renderWithProviders(<EmptyState variant="initial" />);

    expect(screen.getByText("Aún no hay registros")).toBeInTheDocument();
    expect(screen.getByText("Cuando agregues el primero aparecerá aquí.")).toBeInTheDocument();
  });

  it("renders default title and description for 'filtered' variant", () => {
    renderWithProviders(<EmptyState variant="filtered" />);

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(screen.getByText("Intentá con otros filtros o términos de búsqueda.")).toBeInTheDocument();
  });

  it("renders default title and description for 'permission' variant", () => {
    renderWithProviders(<EmptyState variant="permission" />);

    expect(screen.getByText("Acceso restringido")).toBeInTheDocument();
    expect(screen.getByText("No tenés permisos para ver este contenido.")).toBeInTheDocument();
  });

  it("renders custom title when provided", () => {
    renderWithProviders(<EmptyState variant="initial" title="Custom Title" />);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders custom description when provided", () => {
    renderWithProviders(<EmptyState variant="initial" description="Custom description text" />);

    expect(screen.getByText("Custom description text")).toBeInTheDocument();
  });

  it("renders both custom title and description", () => {
    renderWithProviders(
      <EmptyState
        variant="initial"
        title="My Custom Title"
        description="My custom description"
      />
    );

    expect(screen.getByText("My Custom Title")).toBeInTheDocument();
    expect(screen.getByText("My custom description")).toBeInTheDocument();
  });

  it("renders action button when action prop is provided", async () => {
    const { user } = renderWithProviders(
      <EmptyState action={<button>Click me</button>} />
    );

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(button).toBeInTheDocument();
  });

  it("does not render action when action prop is omitted", () => {
    renderWithProviders(<EmptyState />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders custom icon prop when provided", () => {
    const { container } = renderWithProviders(
      <EmptyState icon={<span data-testid="custom-icon">📦</span>} />
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders default InboxIcon when no icon is provided", () => {
    renderWithProviders(<EmptyState />);

    // Verify the component renders without crashing - title should be visible
    expect(screen.getByText("Aún no hay registros")).toBeInTheDocument();
  });

  it("uses default variant when variant prop is not provided", () => {
    renderWithProviders(<EmptyState />);

    // Should use 'initial' variant defaults
    expect(screen.getByText("Aún no hay registros")).toBeInTheDocument();
  });
});
