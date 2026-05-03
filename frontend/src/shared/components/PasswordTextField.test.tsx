import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { PasswordTextField } from "./PasswordTextField";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";

interface TestFormValues extends FieldValues {
  password: string;
}

function TestComponent(props: Omit<React.ComponentProps<typeof PasswordTextField>, "control">) {
  const { control } = useForm<TestFormValues>();
  return <PasswordTextField {...props} control={control} />;
}

describe("PasswordTextField", () => {
  it("should render password field with type='password' by default", () => {
    const { getByDisplayValue } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
      />
    );

    const input = getByDisplayValue("") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("should render label when provided", () => {
    const { getByLabelText } = renderWithProviders(
      <TestComponent
        name="password"
        label="Enter your password"
      />
    );

    expect(getByLabelText("Enter your password")).toBeInTheDocument();
  });

  it("should toggle password visibility when visibility button is clicked", async () => {
    const { getByRole, getByDisplayValue, user } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
      />
    );

    const input = getByDisplayValue("") as HTMLInputElement;

    // Initially hidden
    expect(input.type).toBe("password");

    // Click toggle button to show
    const toggleButton = getByRole("button");
    await user.click(toggleButton);

    // Should now be visible as text
    expect(input.type).toBe("text");
  });

  it("should toggle back to hidden password when visibility button is clicked again", async () => {
    const { getByRole, getByDisplayValue, user } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
      />
    );

    const input = getByDisplayValue("") as HTMLInputElement;
    const toggleButton = getByRole("button");

    // Show password
    await user.click(toggleButton);
    expect(input.type).toBe("text");

    // Hide password again
    await user.click(toggleButton);
    expect(input.type).toBe("password");
  });

  it("should render error state correctly", () => {
    const mockError = { message: "Password is required" };
    const { getByText, getByDisplayValue } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
        error={mockError}
      />
    );

    const input = getByDisplayValue("") as HTMLInputElement;
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(getByText("Password is required")).toBeInTheDocument();
  });

  it("should display helperText from error.message", () => {
    const errorMessage = "Password must be at least 8 characters";
    const mockError = { message: errorMessage };

    const { getByText } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
        error={mockError}
      />
    );

    expect(getByText(errorMessage)).toBeInTheDocument();
  });

  it("should not display error styles when no error is provided", () => {
    const { getByDisplayValue } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
      />
    );

    const input = getByDisplayValue("") as HTMLInputElement;
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("should support autoFocus prop", () => {
    const { getByDisplayValue } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
        autoFocus={true}
      />
    );

    const input = getByDisplayValue("");
    expect(input).toHaveFocus();
  });

  it("should render with Visibility icon when password is hidden", () => {
    const { container } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
      />
    );

    // Check for Visibility icon (shown when password is hidden)
    const icon = container.querySelector("[class*='MuiSvgIcon']");
    expect(icon).toBeInTheDocument();
  });

  it("should render with VisibilityOff icon when password is shown", async () => {
    const { getByRole, user } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
      />
    );

    const toggleButton = getByRole("button");
    await user.click(toggleButton);

    // After clicking, the icon should change to VisibilityOff
    const icon = toggleButton.querySelector("[class*='MuiSvgIcon']");
    expect(icon).toBeInTheDocument();
  });

  it("should have fullWidth behavior from TextField", () => {
    const { getByDisplayValue } = renderWithProviders(
      <TestComponent
        name="password"
        label="Password"
      />
    );

    const input = getByDisplayValue("");
    const textField = input.closest("[class*='MuiTextField']");
    expect(textField).toHaveClass("MuiTextField-root");
  });
});
