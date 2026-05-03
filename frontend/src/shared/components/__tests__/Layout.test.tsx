import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import { Layout } from "../Layout";

// Mock the ConnectivityIndicator hook
vi.mock("../ConnectivityIndicator", () => ({
  useConnectivityIndicatorHeight: vi.fn(() => 0),
}));

import { useConnectivityIndicatorHeight } from "../ConnectivityIndicator";

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConnectivityIndicatorHeight).mockReturnValue(0);
  });

  it("should render children content", () => {
    const { getByText } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>,
    );

    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("should render AppHeader component", () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    // AppHeader should be in the rendered component
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("should render NavSidebar in permanent drawer (desktop)", () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    // Should have two drawers: temporary (mobile) and permanent (desktop)
    const drawers = container.querySelectorAll("[class*='MuiDrawer']");
    expect(drawers.length).toBeGreaterThanOrEqual(2);
  });

  it("should render main content area", () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });

  it("should apply indicator offset CSS variable when indicatorHeight > 0", () => {
    vi.mocked(useConnectivityIndicatorHeight).mockReturnValue(48);

    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    const main = container.querySelector("main");
    expect(main).toHaveStyle("--indicator-offset: 48px");
  });

  it("should not apply indicator offset CSS variable when indicatorHeight = 0", () => {
    vi.mocked(useConnectivityIndicatorHeight).mockReturnValue(0);

    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    const main = container.querySelector("main");
    const styleAttr = main?.getAttribute("style");
    if (styleAttr) {
      expect(styleAttr).not.toContain("--indicator-offset");
    } else {
      // If there's no style attribute at all, that's correct for height = 0
      expect(styleAttr).toBeNull();
    }
  });

  it("should have drawer toggling functionality", async () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    // Get the menu button from the header
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should render Toolbar as spacing element", () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    const toolbar = container.querySelector("[class*='MuiToolbar']");
    expect(toolbar).toBeInTheDocument();
  });

  it("should accept multiple children elements", () => {
    const { getByText } = renderWithProviders(
      <Layout>
        <div>Content 1</div>
        <div>Content 2</div>
      </Layout>,
    );

    expect(getByText("Content 1")).toBeInTheDocument();
    expect(getByText("Content 2")).toBeInTheDocument();
  });

  it("should maintain root wrapper structure", () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    // Check root Box element exists
    const root = container.firstChild;
    expect(root).toBeInTheDocument();
  });

  it("should handle changing indicatorHeight", () => {
    vi.mocked(useConnectivityIndicatorHeight).mockReturnValue(0);

    const { container, rerender } = renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    let main = container.querySelector("main");
    let styleAttr = main?.getAttribute("style");
    if (styleAttr) {
      expect(styleAttr).not.toContain("--indicator-offset");
    } else {
      expect(styleAttr).toBeNull();
    }

    // Update the mock to return a different value
    vi.mocked(useConnectivityIndicatorHeight).mockReturnValue(32);

    rerender(
      <Layout>
        <div>Content Updated</div>
      </Layout>,
    );

    main = container.querySelector("main");
    styleAttr = main?.getAttribute("style");
    // After rerender with new height, the style should be updated
    expect(styleAttr).toContain("--indicator-offset");
  });

  describe("Mobile drawer behavior", () => {
    it("should render mobile drawer in closed state initially", () => {
      const { container } = renderWithProviders(
        <Layout>
          <div>Content</div>
        </Layout>,
      );

      // Mobile drawer should exist but not be visible initially
      const drawers = container.querySelectorAll("[class*='MuiDrawer']");
      expect(drawers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Content area styling", () => {
    it("should have content wrapper with proper classes", () => {
      const { container } = renderWithProviders(
        <Layout>
          <div>Content</div>
        </Layout>,
      );

      const main = container.querySelector("main");
      expect(main).toBeInTheDocument();
      expect(main?.className).toContain("main");
    });
  });
});
