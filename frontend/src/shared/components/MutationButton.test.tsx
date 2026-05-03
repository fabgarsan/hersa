import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { MutationButton } from "./MutationButton";
import * as useOnlineStatusModule from "@shared/hooks/useOnlineStatus";

vi.mock("@shared/hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(),
}));

const DEFAULT_PROPS = {
  isPending: false,
  label: "Submit",
  pendingLabel: "Submitting...",
} as const;

describe("MutationButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(true);
  });

  it("should render with provided label", () => {
    const { getByRole } = renderWithProviders(<MutationButton {...DEFAULT_PROPS} />);
    expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("should render as a submit button by default", () => {
    const { getByRole } = renderWithProviders(<MutationButton {...DEFAULT_PROPS} />);
    expect(getByRole("button", { name: /submit/i })).toHaveAttribute("type", "submit");
  });

  it("should be disabled when isOnline={false}", () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);
    const { getByRole } = renderWithProviders(<MutationButton {...DEFAULT_PROPS} />);
    expect(getByRole("button")).toBeDisabled();
  });

  it("should show offline label text when offline", () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);
    const { getByText } = renderWithProviders(<MutationButton {...DEFAULT_PROPS} />);
    expect(getByText("Sin conexión")).toBeInTheDocument();
  });

  it("should be enabled when isOnline={true}", () => {
    const { getByRole } = renderWithProviders(<MutationButton {...DEFAULT_PROPS} />);
    expect(getByRole("button")).not.toBeDisabled();
  });

  it("should be disabled when disabled={true} prop is passed", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton {...DEFAULT_PROPS} disabled={true} />,
    );
    expect(getByRole("button")).toBeDisabled();
  });

  it("should show pending label when isPending={true}", () => {
    const { getByText } = renderWithProviders(
      <MutationButton {...DEFAULT_PROPS} isPending={true} />,
    );
    expect(getByText("Submitting...")).toBeInTheDocument();
  });

  it("should be disabled when isPending={true}", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton {...DEFAULT_PROPS} isPending={true} />,
    );
    expect(getByRole("button")).toBeDisabled();
  });

  it("should show offline icon when offline", () => {
    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);
    const { container } = renderWithProviders(<MutationButton {...DEFAULT_PROPS} />);
    const wifiIcon = container.querySelector("[data-testid*='WifiOffIcon']");
    expect(wifiIcon || container.querySelector("svg[class*='MuiSvgIcon']")).toBeInTheDocument();
  });

  it("should support fullWidth prop", () => {
    const { getByRole } = renderWithProviders(
      <MutationButton {...DEFAULT_PROPS} fullWidth={true} />,
    );
    expect(getByRole("button")).toHaveClass("MuiButton-fullWidth");
  });

  it("should handle online-offline transitions correctly", () => {
    const { getByRole, rerender } = renderWithProviders(<MutationButton {...DEFAULT_PROPS} />);
    expect(getByRole("button")).not.toBeDisabled();

    vi.mocked(useOnlineStatusModule.useOnlineStatus).mockReturnValue(false);
    rerender(<MutationButton {...DEFAULT_PROPS} />);
    expect(getByRole("button")).toBeDisabled();
  });
});
