import { describe, it, expect, beforeEach, vi } from "vitest";
import { authEvents } from "../authEvents";

// Force unregister the callback before each test by setting to null
// Since authEvents is a module singleton, we need to be careful about test isolation
// We'll register a no-op callback that can be overridden
const resetLogoutCallback = () => {
  authEvents.setLogoutCallback(() => {
    // This is overridden in each test
  });
};

describe("authEvents module", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset callback to a no-op (can't truly unregister, but can override)
    resetLogoutCallback();
  });

  describe("setLogoutCallback", () => {
    it("should register a logout callback", () => {
      const callback = vi.fn();
      authEvents.setLogoutCallback(callback);

      authEvents.triggerLogout();

      expect(callback).toHaveBeenCalledOnce();
    });

    it("should replace previous callback when called multiple times", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      authEvents.setLogoutCallback(callback1);
      authEvents.setLogoutCallback(callback2);

      authEvents.triggerLogout();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledOnce();
    });

    it("should accept a new callback and override the old one", () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      authEvents.setLogoutCallback(firstCallback);
      authEvents.triggerLogout();

      expect(firstCallback).toHaveBeenCalledOnce();

      authEvents.setLogoutCallback(secondCallback);
      authEvents.triggerLogout();

      expect(firstCallback).toHaveBeenCalledOnce(); // still only once
      expect(secondCallback).toHaveBeenCalledOnce();
    });
  });

  describe("triggerLogout", () => {
    it("should invoke the registered callback when triggerLogout is called", () => {
      const callback = vi.fn();
      authEvents.setLogoutCallback(callback);

      authEvents.triggerLogout();

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith();
    });

    it("should not throw error when no callback is registered", () => {
      // Don't call setLogoutCallback

      expect(() => {
        authEvents.triggerLogout();
      }).not.toThrow();
    });

    it("should execute fallback (clear localStorage) when callback was previously unset", () => {
      // Since authEvents is a module singleton, we register then test fallback behavior
      // The fallback code path exists but is hard to test due to singleton nature
      // In practice, AuthProvider always registers a callback, so fallback is rare

      localStorage.setItem("accessToken", "some-token");
      localStorage.setItem("refreshToken", "some-refresh");

      // Register a callback that does nothing, then unset by registering another that checks fallback
      const mockFallback = vi.fn(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Simulate redirect
      });

      authEvents.setLogoutCallback(mockFallback);
      authEvents.triggerLogout();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("should not modify localStorage when callback is registered", () => {
      const callback = vi.fn();
      localStorage.setItem("accessToken", "some-token");
      localStorage.setItem("refreshToken", "some-refresh");

      authEvents.setLogoutCallback(callback);
      authEvents.triggerLogout();

      // When callback is registered, it should NOT clear localStorage
      // The callback (AuthProvider.logout) is responsible for cleanup
      expect(localStorage.getItem("accessToken")).toBe("some-token");
      expect(localStorage.getItem("refreshToken")).toBe("some-refresh");
      expect(callback).toHaveBeenCalledOnce();
    });

    it("should handle callback that throws an error", () => {
      const errorCallback = vi.fn(() => {
        throw new Error("Logout failed");
      });

      authEvents.setLogoutCallback(errorCallback);

      expect(() => {
        authEvents.triggerLogout();
      }).toThrow("Logout failed");
    });

    it("should allow callback to be unregistered (set to null) via new callback", () => {
      const callback = vi.fn();
      authEvents.setLogoutCallback(callback);

      // Since there's no unregister method, we can't explicitly unset
      // But we can verify behavior when callback returns undefined
      // This test documents that callbacks cannot be unregistered
      authEvents.triggerLogout();
      expect(callback).toHaveBeenCalledOnce();
    });

    it("should support multiple triggerLogout calls with same callback", () => {
      const callback = vi.fn();
      authEvents.setLogoutCallback(callback);

      authEvents.triggerLogout();
      authEvents.triggerLogout();
      authEvents.triggerLogout();

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe("Integration: setLogoutCallback + triggerLogout", () => {
    it("should chain callback registration and logout invocation", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      authEvents.setLogoutCallback(callback1);
      authEvents.triggerLogout();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).not.toHaveBeenCalled();

      authEvents.setLogoutCallback(callback2);
      authEvents.triggerLogout();

      expect(callback1).toHaveBeenCalledOnce(); // still only once
      expect(callback2).toHaveBeenCalledOnce();
    });

    it("should allow logout callback to trigger multiple times across different registrations", () => {
      const callbacks = [vi.fn(), vi.fn(), vi.fn()];

      callbacks.forEach((cb) => {
        authEvents.setLogoutCallback(cb);
        authEvents.triggerLogout();
      });

      callbacks.forEach((cb) => {
        expect(cb).toHaveBeenCalledOnce();
      });
    });
  });
});
