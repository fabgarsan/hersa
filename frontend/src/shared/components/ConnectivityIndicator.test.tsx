import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { renderWithProviders } from "@/tests/utils";
import { ConnectivityIndicator } from "./ConnectivityIndicator";

// Mock the window.matchMedia for tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe("ConnectivityIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(true); // Desktop by default
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not render any visible element when online", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);

    // Component returns null when hidden
    const indicator = container.querySelector("[role='status']");
    expect(indicator).not.toBeInTheDocument();
  });

  it("should render a visible indicator when offline", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);

    // Skip init guard delay with act
    act(() => {
      vi.advanceTimersByTime(900);
    });

    const indicator = container.querySelector("[role='status']");
    expect(indicator).toBeInTheDocument();
  });

  it("should have status role for accessibility", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    const indicator = container.querySelector("[role='status']");
    expect(indicator).toHaveAttribute("aria-live", "polite");
  });

  it("should have accessible aria-label", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    const indicator = container.querySelector("[role='status']");
    expect(indicator).toHaveAttribute("aria-label", "Estado de conectividad");
  });

  it("should render WifiOffIcon when offline", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should display offline message on desktop when offline", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    mockMatchMedia(true); // Desktop

    const { container } = renderWithProviders(<ConnectivityIndicator />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(container.textContent).toContain("Sin conexión");
  });

  it("should display short offline message on mobile when offline", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    mockMatchMedia(false); // Mobile

    const { container } = renderWithProviders(<ConnectivityIndicator />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(container.textContent).toContain("Sin señal");
  });

  it("should display reconnected message", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    // Simulate offline event
    act(() => {
      const offlineEvent = new Event("offline");
      window.dispatchEvent(offlineEvent);
      vi.runOnlyPendingTimers();
    });

    // Simulate going back online
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
    act(() => {
      const onlineEvent = new Event("online");
      window.dispatchEvent(onlineEvent);
      vi.runOnlyPendingTimers();
    });

    expect(container.textContent).toContain("Conexión restaurada");
  });

  it("should respect INIT_GUARD_MS before showing offline state", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);

    // Before 800ms, should not show
    act(() => {
      vi.advanceTimersByTime(400);
    });
    let indicator = container.querySelector("[role='status']");
    expect(indicator).not.toBeInTheDocument();

    // After 800ms, should show
    act(() => {
      vi.advanceTimersByTime(400);
    });
    indicator = container.querySelector("[role='status']");
    expect(indicator).toBeInTheDocument();
  });

  it("should hide indicator after reconnection fade out", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    const { container } = renderWithProviders(<ConnectivityIndicator />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    // Go offline
    act(() => {
      const offlineEvent = new Event("offline");
      window.dispatchEvent(offlineEvent);
      vi.runOnlyPendingTimers();
    });

    // Go online
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
    act(() => {
      const onlineEvent = new Event("online");
      window.dispatchEvent(onlineEvent);

      // Wait for reconnected display time (4000ms) + fade out (250ms)
      vi.advanceTimersByTime(4250);
    });

    // After fade out, should be hidden
    const indicator = container.querySelector("[role='status']");
    expect(indicator).not.toBeInTheDocument();
  });
});
