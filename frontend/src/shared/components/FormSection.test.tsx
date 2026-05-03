import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { FormSection } from "./FormSection";

describe("FormSection", () => {
  it("renders title", () => {
    renderWithProviders(
      <FormSection title="Personal Information">
        <div>Form fields</div>
      </FormSection>,
    );

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    renderWithProviders(
      <FormSection title="Account Settings" subtitle="Manage your profile details">
        <div>Form fields</div>
      </FormSection>,
    );

    expect(screen.getByText("Manage your profile details")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    renderWithProviders(
      <FormSection title="Account Settings">
        <div>Form fields</div>
      </FormSection>,
    );

    expect(screen.queryByText(/Manage|subtitle/i)).not.toBeInTheDocument();
  });

  it("renders children", () => {
    renderWithProviders(
      <FormSection title="Personal Info">
        <input placeholder="First Name" />
        <input placeholder="Last Name" />
      </FormSection>,
    );

    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
  });

  it("renders divider by default", () => {
    const { container } = renderWithProviders(
      <FormSection title="Contact Details">
        <div>Fields</div>
      </FormSection>,
    );

    const divider = container.querySelector(".MuiDivider-root");
    expect(divider).toBeInTheDocument();
  });

  it("does not render divider when divider prop is false", () => {
    const { container } = renderWithProviders(
      <FormSection title="Contact Details" divider={false}>
        <div>Fields</div>
      </FormSection>,
    );

    const divider = container.querySelector(".MuiDivider-root");
    expect(divider).not.toBeInTheDocument();
  });

  it("renders divider when divider prop is explicitly true", () => {
    const { container } = renderWithProviders(
      <FormSection title="Contact Details" divider={true}>
        <div>Fields</div>
      </FormSection>,
    );

    const divider = container.querySelector(".MuiDivider-root");
    expect(divider).toBeInTheDocument();
  });

  it("renders title in subtitle2 typography variant", () => {
    renderWithProviders(
      <FormSection title="Settings">
        <div>Content</div>
      </FormSection>,
    );

    const title = screen.getByText("Settings");
    expect(title).toHaveClass("MuiTypography-subtitle2");
  });

  it("renders subtitle in body2 typography variant", () => {
    renderWithProviders(
      <FormSection title="Settings" subtitle="Configure your preferences">
        <div>Content</div>
      </FormSection>,
    );

    const subtitle = screen.getByText("Configure your preferences");
    expect(subtitle).toHaveClass("MuiTypography-body2");
  });

  it("renders multiple form fields as children", () => {
    renderWithProviders(
      <FormSection title="Edit Profile">
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <textarea placeholder="Bio"></textarea>
        <button>Save</button>
      </FormSection>,
    );

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Bio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("renders with title, subtitle, and divider together", () => {
    const { container } = renderWithProviders(
      <FormSection
        title="Billing Address"
        subtitle="Where should we send your invoice?"
        divider={true}
      >
        <input type="text" placeholder="Street Address" />
      </FormSection>,
    );

    expect(screen.getByText("Billing Address")).toBeInTheDocument();
    expect(screen.getByText("Where should we send your invoice?")).toBeInTheDocument();
    expect(container.querySelector(".MuiDivider-root")).toBeInTheDocument();
  });

  it("renders without divider when explicitly disabled", () => {
    const { container } = renderWithProviders(
      <FormSection title="Section Without Divider" subtitle="Optional description" divider={false}>
        <div>Content here</div>
      </FormSection>,
    );

    expect(screen.getByText("Section Without Divider")).toBeInTheDocument();
    expect(screen.getByText("Optional description")).toBeInTheDocument();
    expect(container.querySelector(".MuiDivider-root")).not.toBeInTheDocument();
  });
});
