import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { DetailDrawer } from "./DetailDrawer";

describe("DetailDrawer", () => {
  it("should not render content when open={false}", () => {
    const { queryByText } = renderWithProviders(
      <DetailDrawer
        open={false}
        onClose={vi.fn()}
        title="Detail Panel"
      >
        <div>Content goes here</div>
      </DetailDrawer>
    );

    expect(queryByText("Detail Panel")).not.toBeInTheDocument();
    expect(queryByText("Content goes here")).not.toBeInTheDocument();
  });

  it("should render title when open={true}", () => {
    const { getByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
      >
        <div>Content goes here</div>
      </DetailDrawer>
    );

    expect(getByText("Detail Panel")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    const { getByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
        subtitle="Additional info"
      >
        <div>Content goes here</div>
      </DetailDrawer>
    );

    expect(getByText("Additional info")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    const { queryByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
      >
        <div>Content goes here</div>
      </DetailDrawer>
    );

    expect(queryByText(/Additional info/)).not.toBeInTheDocument();
  });

  it("should render children content", () => {
    const { getByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
      >
        <div>Custom content inside drawer</div>
      </DetailDrawer>
    );

    expect(getByText("Custom content inside drawer")).toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    const { getByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
        actions={<button>Save</button>}
      >
        <div>Content</div>
      </DetailDrawer>
    );

    expect(getByText("Save")).toBeInTheDocument();
  });

  it("should not render actions section when actions not provided", () => {
    const { getAllByRole } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
      >
        <div>Content</div>
      </DetailDrawer>
    );

    // When no actions are passed, the actions Stack should not be rendered at all
    const buttons = getAllByRole("button");
    // Only the close button should exist
    expect(buttons).toHaveLength(1);
  });

  it("should call onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    const { getByLabelText, user } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={handleClose}
        title="Detail Panel"
      >
        <div>Content</div>
      </DetailDrawer>
    );

    const closeButton = getByLabelText("Cerrar");
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should accept custom width prop", () => {
    const { getByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
        width={600}
      >
        <div>Content with custom width</div>
      </DetailDrawer>
    );

    // Verify drawer renders with content (width is applied via slotProps)
    expect(getByText("Content with custom width")).toBeInTheDocument();
  });

  it("should accept width as string", () => {
    const { getByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
        width="50%"
      >
        <div>String width content</div>
      </DetailDrawer>
    );

    expect(getByText("String width content")).toBeInTheDocument();
  });

  it("should use default width when not provided", () => {
    const { getByText } = renderWithProviders(
      <DetailDrawer
        open={true}
        onClose={vi.fn()}
        title="Detail Panel"
      >
        <div>Default width content</div>
      </DetailDrawer>
    );

    expect(getByText("Default width content")).toBeInTheDocument();
  });
});
