import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders } from "@/tests/utils";
import NotFoundPage from "../NotFoundPage";

describe("NotFoundPage", () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = originalTitle;
    vi.clearAllMocks();
  });

  describe("fullPage=false (default)", () => {
    it("should render as section element when fullPage=false", () => {
      const { container } = renderWithProviders(<NotFoundPage fullPage={false} />);
      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("should render 404 error code", () => {
      const { getByText } = renderWithProviders(<NotFoundPage fullPage={false} />);
      expect(getByText("404")).toBeInTheDocument();
    });

    it("should render page not found headline", () => {
      const { getByText } = renderWithProviders(<NotFoundPage fullPage={false} />);
      expect(getByText("Página no encontrada")).toBeInTheDocument();
    });

    it("should render 'Volver al inicio' button", () => {
      const { getByRole } = renderWithProviders(<NotFoundPage fullPage={false} />);
      const button = getByRole("button", { name: /volver al inicio/i });
      expect(button).toBeInTheDocument();
    });

    it("should not render 'Volver' button when window.history.length <= 1", () => {
      const originalLength = window.history.length;
      Object.defineProperty(window.history, "length", {
        value: 1,
        writable: true,
      });

      const { queryByRole } = renderWithProviders(<NotFoundPage fullPage={false} />);
      const backButton = queryByRole("button", { name: /^Volver$/ });
      expect(backButton).not.toBeInTheDocument();

      Object.defineProperty(window.history, "length", {
        value: originalLength,
        writable: true,
      });
    });

    it("should only render 'Volver al inicio' button when fullPage=false regardless of history length", () => {
      const { getByRole, queryAllByRole } = renderWithProviders(<NotFoundPage fullPage={false} />);

      expect(getByRole("button", { name: /volver al inicio/i })).toBeInTheDocument();
      const buttons = queryAllByRole("button");
      expect(buttons).toHaveLength(1);
    });

    it("should update document.title on mount", () => {
      renderWithProviders(<NotFoundPage fullPage={false} />);
      expect(document.title).toBe("404 - Página no encontrada | Hersa");
    });

    it("should restore document.title on unmount", () => {
      const { unmount } = renderWithProviders(<NotFoundPage fullPage={false} />);
      expect(document.title).toBe("404 - Página no encontrada | Hersa");
      unmount();
      expect(document.title).toBe(originalTitle);
    });
  });

  describe("fullPage=true", () => {
    it("should render as main element when fullPage=true", () => {
      const { container } = renderWithProviders(<NotFoundPage fullPage={true} />);
      const main = container.querySelector("main");
      expect(main).toBeInTheDocument();
    });

    it("should render 404 error code", () => {
      const { getByText } = renderWithProviders(<NotFoundPage fullPage={true} />);
      expect(getByText("404")).toBeInTheDocument();
    });

    it("should render page not found headline", () => {
      const { getByText } = renderWithProviders(<NotFoundPage fullPage={true} />);
      expect(getByText("Página no encontrada")).toBeInTheDocument();
    });

    it("should render 'Volver al inicio' button", () => {
      const { getByRole } = renderWithProviders(<NotFoundPage fullPage={true} />);
      const button = getByRole("button", { name: /volver al inicio/i });
      expect(button).toBeInTheDocument();
    });

    it("should not render 'Volver' button when window.history.length <= 1", () => {
      const originalLength = window.history.length;
      Object.defineProperty(window.history, "length", {
        value: 1,
        writable: true,
      });

      const { queryByRole } = renderWithProviders(<NotFoundPage fullPage={true} />);
      const backButton = queryByRole("button", { name: /^Volver$/ });
      expect(backButton).not.toBeInTheDocument();

      Object.defineProperty(window.history, "length", {
        value: originalLength,
        writable: true,
      });
    });

    it("should render both buttons when window.history.length > 1", () => {
      const originalLength = window.history.length;
      Object.defineProperty(window.history, "length", {
        value: 2,
        writable: true,
      });

      const { getByRole } = renderWithProviders(<NotFoundPage fullPage={true} />);
      expect(getByRole("button", { name: /volver al inicio/i })).toBeInTheDocument();
      expect(getByRole("button", { name: /^Volver$/i })).toBeInTheDocument();

      Object.defineProperty(window.history, "length", {
        value: originalLength,
        writable: true,
      });
    });

    it("should update document.title on mount", () => {
      renderWithProviders(<NotFoundPage fullPage={true} />);
      expect(document.title).toBe("404 - Página no encontrada | Hersa");
    });

    it("should restore document.title on unmount", () => {
      const { unmount } = renderWithProviders(<NotFoundPage fullPage={true} />);
      expect(document.title).toBe("404 - Página no encontrada | Hersa");
      unmount();
      expect(document.title).toBe(originalTitle);
    });
  });

  describe("Navigation buttons", () => {
    it("should navigate to HOME when 'Volver al inicio' button is clicked", async () => {
      const { getByRole, user } = renderWithProviders(<NotFoundPage fullPage={false} />);
      const button = getByRole("button", { name: /volver al inicio/i });
      await user.click(button);
      expect(button).toBeInTheDocument();
    });

    it("should navigate back when 'Volver' button is clicked", async () => {
      const originalLength = window.history.length;
      Object.defineProperty(window.history, "length", {
        value: 2,
        writable: true,
      });

      const { getByRole, user } = renderWithProviders(<NotFoundPage fullPage={false} />);
      const backButton = getByRole("button", { name: /volver/i });
      await user.click(backButton);
      expect(backButton).toBeInTheDocument();

      Object.defineProperty(window.history, "length", {
        value: originalLength,
        writable: true,
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria labels and roles", () => {
      const { container } = renderWithProviders(<NotFoundPage fullPage={true} />);
      const main = container.querySelector("main");
      expect(main).toHaveAttribute("role", "main");
      expect(main).toHaveAttribute("aria-label", "Página no encontrada");
    });

    it("should have proper heading hierarchy when fullPage=true", () => {
      const { container } = renderWithProviders(<NotFoundPage fullPage={true} />);
      const h1 = container.querySelector("h1");
      expect(h1).toBeInTheDocument();
      expect(h1?.textContent).toContain("Página no encontrada");
    });

    it("should have proper heading hierarchy when fullPage=false", () => {
      const { container } = renderWithProviders(<NotFoundPage fullPage={false} />);
      const h2 = container.querySelector("h2");
      expect(h2).toBeInTheDocument();
      expect(h2?.textContent).toContain("Página no encontrada");
    });

    it("should have searchOffIcon hidden from screen readers", () => {
      const { container } = renderWithProviders(<NotFoundPage fullPage={true} />);
      const icon = container.querySelector("svg[class*='MuiSvgIcon']");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });
});
