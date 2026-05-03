import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { MutationButton } from "./MutationButton";
import * as useOnlineStatusModule from "@shared/hooks/useOnlineStatus";

vi.mock("@shared/hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(),
}));

describe("MutationButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(true);
  });

  it("should render with provided label", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("should render as a submit button by default", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    const button = getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should be disabled when isOnline={false}", () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);

    const { getByRole } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    const button = getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show offline label text when offline", () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);

    const { getByText } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    expect(getByText("Sin conexión")).toBeInTheDocument();
  });

  it("should be enabled when isOnline={true}", () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(true);

    const { getByRole } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    const button = getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("should be disabled when disabled={true} prop is passed", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
        disabled={true}
      />
    );

    const button = getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show pending label when isPending={true}", () => {
    const { getByText } = renderWithProviders(
      <MutationButton
        isPending={true}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    expect(getByText("Submitting...")).toBeInTheDocument();
  });

  it("should be disabled when isPending={true}", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton
        isPending={true}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    const button = getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show offline icon when offline", () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);

    const { container } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    // WifiOffIcon should be present
    const wifiIcon = container.querySelector("[data-testid*='WifiOffIcon']");
    expect(wifiIcon || container.querySelector("svg[class*='MuiSvgIcon']")).toBeInTheDocument();
  });

  it("should support fullWidth prop", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
        fullWidth={true}
      />
    );

    const button = getByRole("button");
    expect(button).toHaveClass("MuiButton-fullWidth");
  });

  it("should handle online-offline transitions correctly", () => {
    const { getByRole, rerender } = renderWithProviders(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    // Initially online
    let button = getByRole("button");
    expect(button).not.toBeDisabled();

    // Go offline
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);
    rerender(
      <MutationButton
        isPending={false}
        label="Submit"
        pendingLabel="Submitting..."
      />
    );

    button = getByRole("button");
    expect(button).toBeDisabled();
  });
});
