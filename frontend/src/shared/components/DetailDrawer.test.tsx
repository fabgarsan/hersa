import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { DetailDrawer } from "./DetailDrawer";

describe("DetailDrawer", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderDrawer(
    overrides: Partial<Omit<React.ComponentProps<typeof DetailDrawer>, "children">> = {},
    children: React.ReactNode = <div>Content goes here</div>,
  ) {
    return renderWithProviders(
      <DetailDrawer open={true} onClose={onClose} title="Detail Panel" {...overrides}>
        {children}
      </DetailDrawer>,
    );
  }

  it("should not render content when open={false}", () => {
    const { queryByText } = renderWithProviders(
      <DetailDrawer open={false} onClose={vi.fn()} title="Detail Panel">
        <div>Content goes here</div>
      </DetailDrawer>,
    );
    expect(queryByText("Detail Panel")).not.toBeInTheDocument();
    expect(queryByText("Content goes here")).not.toBeInTheDocument();
  });

  it("should render title when open={true}", () => {
    const { getByText } = renderDrawer();
    expect(getByText("Detail Panel")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    const { getByText } = renderDrawer({ subtitle: "Additional info" });
    expect(getByText("Additional info")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    const { queryByText } = renderDrawer();
    expect(queryByText(/Additional info/)).not.toBeInTheDocument();
  });

  it("should render children content", () => {
    const { getByText } = renderDrawer({}, <div>Custom content inside drawer</div>);
    expect(getByText("Custom content inside drawer")).toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    const { getByText } = renderDrawer({ actions: <button>Save</button> });
    expect(getByText("Save")).toBeInTheDocument();
  });

  it("should not render actions section when actions not provided", () => {
    const { getAllByRole } = renderDrawer();
    // Only the close button should exist
    expect(getAllByRole("button")).toHaveLength(1);
  });

  it("should call onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    const { getByLabelText, user } = renderDrawer({ onClose: handleClose });
    await user.click(getByLabelText("Cerrar"));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should accept custom width prop", () => {
    const { getByText } = renderDrawer({ width: 600 }, <div>Content with custom width</div>);
    expect(getByText("Content with custom width")).toBeInTheDocument();
  });

  it("should accept width as string", () => {
    const { getByText } = renderDrawer({ width: "50%" }, <div>String width content</div>);
    expect(getByText("String width content")).toBeInTheDocument();
  });

  it("should use default width when not provided", () => {
    const { getByText } = renderDrawer({}, <div>Default width content</div>);
    expect(getByText("Default width content")).toBeInTheDocument();
  });
});
