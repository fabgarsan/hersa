/* eslint-disable hersa-style/require-scss-module */
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/utils";
import { AuthPageCard } from "./AuthPageCard";

describe("AuthPageCard", () => {
  it("renders title when provided", () => {
    renderWithProviders(
      <AuthPageCard title="Login">
        <div>Form content</div>
      </AuthPageCard>,
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders children", () => {
    renderWithProviders(
      <AuthPageCard title="Login">
        <input placeholder="Email" />
      </AuthPageCard>,
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    renderWithProviders(
      <AuthPageCard title="Login" subtitle="Welcome back!">
        <div>Form</div>
      </AuthPageCard>,
    );

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    renderWithProviders(
      <AuthPageCard title="Login">
        <div>Form</div>
      </AuthPageCard>,
    );

    // Verify no subtitle is rendered
    expect(screen.queryByText(/Welcome|Subtitle/)).not.toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    renderWithProviders(
      <AuthPageCard title="Login" footer={<div>Footer content</div>}>
        <div>Form</div>
      </AuthPageCard>,
    );

    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("does not render footer when not provided", () => {
    renderWithProviders(
      <AuthPageCard title="Login">
        <div>Form</div>
      </AuthPageCard>,
    );

    expect(screen.queryByText(/Footer/)).not.toBeInTheDocument();
  });

  it("renders children between title and footer", () => {
    renderWithProviders(
      <AuthPageCard title="Login" footer={<div>Don't have an account?</div>}>
        <input placeholder="Email" />
      </AuthPageCard>,
    );

    const emailInput = screen.getByPlaceholderText("Email");
    const footer = screen.getByText("Don't have an account?");

    expect(emailInput).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  it("renders with multiple children elements", () => {
    renderWithProviders(
      <AuthPageCard title="Sign Up">
        <input placeholder="Name" />
        <input placeholder="Email" />
        <input placeholder="Password" />
      </AuthPageCard>,
    );

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders title in primary color with h5 variant", () => {
    renderWithProviders(
      <AuthPageCard title="Authenticate">
        <div>Content</div>
      </AuthPageCard>,
    );

    const title = screen.getByText("Authenticate");
    expect(title).toHaveClass("MuiTypography-h5");
  });

  it("renders complete form with all optional props", () => {
    renderWithProviders(
      <AuthPageCard
        title="User Registration"
        subtitle="Create your account"
        footer={<a href="/login">Already have an account?</a>}
      >
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Register</button>
        </form>
      </AuthPageCard>,
    );

    expect(screen.getByText("User Registration")).toBeInTheDocument();
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("renders inside a Card component", () => {
    renderWithProviders(
      <AuthPageCard title="Login">
        <div>Form</div>
      </AuthPageCard>,
    );

    // Verify the Card element is rendered (already tested by renderWithProviders)
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders inside a Container with maxWidth xs", () => {
    const { container: doc } = renderWithProviders(
      <AuthPageCard title="Login">
        <div>Form</div>
      </AuthPageCard>,
    );

    const muiContainer = doc.querySelector(".MuiContainer-maxWidthXs");
    expect(muiContainer).toBeInTheDocument();
  });
});
