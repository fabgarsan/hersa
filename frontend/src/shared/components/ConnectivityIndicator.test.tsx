import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { renderWithProviders } from "@/tests/utils";
import { ConnectivityIndicator } from "./ConnectivityIndicator";

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

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", { writable: true, value });
}

// Mirrors the INIT_GUARD_MS constant in ConnectivityIndicator.tsx — update both if it changes.
const INIT_GUARD_MS = 800;

function renderOffline() {
  setOnline(false);
  const result = renderWithProviders(<ConnectivityIndicator />);
  act(() => {
    vi.advanceTimersByTime(INIT_GUARD_MS + 100);
  });
  return result;
}

describe("ConnectivityIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(true); // Desktop by default
  });

  afterEach(() => {
    vi.useRealTimers();
    setOnline(true);
  });

  it("should not render any visible element when online", () => {
    setOnline(true);
    const { container } = renderWithProviders(<ConnectivityIndicator />);
    expect(container.querySelector("[role='status']")).not.toBeInTheDocument();
  });

  it("should render a visible indicator when offline", () => {
    const { container } = renderOffline();
    expect(container.querySelector("[role='status']")).toBeInTheDocument();
  });

  it("should have status role for accessibility", () => {
    const { container } = renderOffline();
    expect(container.querySelector("[role='status']")).toHaveAttribute("aria-live", "polite");
  });

  it("should have accessible aria-label", () => {
    const { container } = renderOffline();
    expect(container.querySelector("[role='status']")).toHaveAttribute(
      "aria-label",
      "Estado de conectividad",
    );
  });

  it("should render WifiOffIcon when offline", () => {
    const { container } = renderOffline();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should display offline message on desktop when offline", () => {
    mockMatchMedia(true);
    const { container } = renderOffline();
    expect(container.textContent).toContain("Sin conexión");
  });

  it("should display short offline message on mobile when offline", () => {
    mockMatchMedia(false);
    const { container } = renderOffline();
    expect(container.textContent).toContain("Sin señal");
  });

  it("should display reconnected message", () => {
    const { container } = renderOffline();
    act(() => {
      window.dispatchEvent(new Event("offline"));
      vi.runOnlyPendingTimers();
    });
    setOnline(true);
    act(() => {
      window.dispatchEvent(new Event("online"));
      vi.runOnlyPendingTimers();
    });
    expect(container.textContent).toContain("Conexión restaurada");
  });

  it("should respect INIT_GUARD_MS before showing offline state", () => {
    setOnline(false);
    const { container } = renderWithProviders(<ConnectivityIndicator />);
    const halfGuard = INIT_GUARD_MS / 2;

    act(() => {
      vi.advanceTimersByTime(halfGuard);
    });
    expect(container.querySelector("[role='status']")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(halfGuard);
    });
    expect(container.querySelector("[role='status']")).toBeInTheDocument();
  });

  it("should hide indicator after reconnection fade out", () => {
    const { container } = renderOffline();
    act(() => {
      window.dispatchEvent(new Event("offline"));
      vi.runOnlyPendingTimers();
    });
    setOnline(true);
    act(() => {
      window.dispatchEvent(new Event("online"));
      vi.advanceTimersByTime(4250);
    });
    expect(container.querySelector("[role='status']")).not.toBeInTheDocument();
  });
});
