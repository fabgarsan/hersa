import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { ModuleLayout } from "./ModuleLayout";

describe("ModuleLayout", () => {
  it("renders title", () => {
    renderWithProviders(
      <ModuleLayout title="Dashboard">
        <div>Content</div>
      </ModuleLayout>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    renderWithProviders(
      <ModuleLayout title="Invoices" subtitle="Manage all invoices">
        <div>Content</div>
      </ModuleLayout>,
    );

    expect(screen.getByText("Manage all invoices")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    renderWithProviders(
      <ModuleLayout title="Invoices">
        <div>Content</div>
      </ModuleLayout>,
    );

    expect(screen.queryByText(/Manage|subtitle/i)).not.toBeInTheDocument();
  });

  it("renders children", () => {
    renderWithProviders(
      <ModuleLayout title="Users">
        <table>
          <tbody>
            <tr>
              <td>User data</td>
            </tr>
          </tbody>
        </table>
      </ModuleLayout>,
    );

    expect(screen.getByText("User data")).toBeInTheDocument();
  });

  it("renders actions slot when provided", () => {
    renderWithProviders(
      <ModuleLayout title="Invoices" actions={<button>Create Invoice</button>}>
        <div>Content</div>
      </ModuleLayout>,
    );

    expect(screen.getByRole("button", { name: /create invoice/i })).toBeInTheDocument();
  });

  it("does not render actions slot when omitted", () => {
    renderWithProviders(
      <ModuleLayout title="Invoices">
        <div>Content</div>
      </ModuleLayout>,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders title in h5 heading variant", () => {
    renderWithProviders(
      <ModuleLayout title="Dashboard">
        <div>Content</div>
      </ModuleLayout>,
    );

    const title = screen.getByRole("heading", { level: 5 });
    expect(title).toHaveTextContent("Dashboard");
  });

  it("renders subtitle in body2 typography", () => {
    renderWithProviders(
      <ModuleLayout title="Events" subtitle="All graduation events">
        <div>Content</div>
      </ModuleLayout>,
    );

    const subtitle = screen.getByText("All graduation events");
    expect(subtitle).toHaveClass("MuiTypography-body2");
  });

  it("renders footer when provided", () => {
    renderWithProviders(
      <ModuleLayout title="Dashboard" footer={<div>Footer content</div>}>
        <div>Main content</div>
      </ModuleLayout>,
    );

    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("does not render footer when not provided", () => {
    renderWithProviders(
      <ModuleLayout title="Dashboard">
        <div>Content</div>
      </ModuleLayout>,
    );

    expect(screen.queryByText(/footer|Footer/i)).not.toBeInTheDocument();
  });

  it("renders header with title and actions side by side", () => {
    renderWithProviders(
      <ModuleLayout title="Events" actions={<button>Add Event</button>}>
        <div>Events list</div>
      </ModuleLayout>,
    );

    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add event/i })).toBeInTheDocument();
  });

  it("renders with title, subtitle, and actions together", () => {
    renderWithProviders(
      <ModuleLayout
        title="Invoices"
        subtitle="Manage customer invoices"
        actions={<button>New Invoice</button>}
      >
        <table>
          <tr>
            <td>Invoice list</td>
          </tr>
        </table>
      </ModuleLayout>,
    );

    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Manage customer invoices")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new invoice/i })).toBeInTheDocument();
  });

  it("renders with complete structure: title, subtitle, actions, children, footer", () => {
    renderWithProviders(
      <ModuleLayout
        title="Products"
        subtitle="Manage all products"
        actions={<button>Add Product</button>}
        footer={<div>Total: 42 products</div>}
      >
        <div>Product list</div>
      </ModuleLayout>,
    );

    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Manage all products")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add product/i })).toBeInTheDocument();
    expect(screen.getByText("Product list")).toBeInTheDocument();
    expect(screen.getByText("Total: 42 products")).toBeInTheDocument();
  });

  it("renders multiple action buttons in actions slot", () => {
    renderWithProviders(
      <ModuleLayout
        title="Settings"
        actions={
          <div>
            <button>Save</button>
            <button>Reset</button>
          </div>
        }
      >
        <div>Settings form</div>
      </ModuleLayout>,
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("renders header text container with title and subtitle", () => {
    renderWithProviders(
      <ModuleLayout title="Module" subtitle="Description">
        <div>Content</div>
      </ModuleLayout>,
    );

    expect(screen.getByText("Module")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});
