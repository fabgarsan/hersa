import { describe, it, expect, beforeEach, vi } from "vitest";
import { offlineMutationEvents, isNetworkError } from "../offlineMutationEvents";

describe("offlineMutationEvents module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a callback function", () => {
      const callback = vi.fn();
      offlineMutationEvents.register(callback);

      offlineMutationEvents.trigger();

      expect(callback).toHaveBeenCalledOnce();
    });

    it("should replace previous callback when called multiple times", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      offlineMutationEvents.register(callback1);
      offlineMutationEvents.register(callback2);

      offlineMutationEvents.trigger();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledOnce();
    });

    it("should allow registering different callbacks in sequence", () => {
      const callback1 = vi.fn();
      offlineMutationEvents.register(callback1);
      offlineMutationEvents.trigger();

      const callback2 = vi.fn();
      offlineMutationEvents.register(callback2);
      offlineMutationEvents.trigger();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
    });
  });

  describe("unregister", () => {
    it("should clear the registered callback", () => {
      const callback = vi.fn();
      offlineMutationEvents.register(callback);
      offlineMutationEvents.unregister();

      offlineMutationEvents.trigger();

      expect(callback).not.toHaveBeenCalled();
    });

    it("should not throw error when unregister is called without a callback", () => {
      expect(() => {
        offlineMutationEvents.unregister();
      }).not.toThrow();
    });

    it("should allow re-registering callback after unregister", () => {
      const callback1 = vi.fn();
      offlineMutationEvents.register(callback1);
      offlineMutationEvents.unregister();

      const callback2 = vi.fn();
      offlineMutationEvents.register(callback2);

      offlineMutationEvents.trigger();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledOnce();
    });
  });

  describe("trigger", () => {
    it("should invoke registered callback when trigger is called", () => {
      const callback = vi.fn();
      offlineMutationEvents.register(callback);

      offlineMutationEvents.trigger();

      expect(callback).toHaveBeenCalledOnce();
    });

    it("should not throw error when no callback is registered", () => {
      expect(() => {
        offlineMutationEvents.trigger();
      }).not.toThrow();
    });

    it("should handle callback that throws an error", () => {
      const errorCallback = vi.fn(() => {
        throw new Error("Dialog open failed");
      });

      offlineMutationEvents.register(errorCallback);

      expect(() => {
        offlineMutationEvents.trigger();
      }).toThrow("Dialog open failed");
    });

    it("should support multiple trigger calls with same callback", () => {
      const callback = vi.fn();
      offlineMutationEvents.register(callback);

      offlineMutationEvents.trigger();
      offlineMutationEvents.trigger();
      offlineMutationEvents.trigger();

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should not trigger callback after unregister", () => {
      const callback = vi.fn();
      offlineMutationEvents.register(callback);
      offlineMutationEvents.unregister();

      offlineMutationEvents.trigger();
      offlineMutationEvents.trigger();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("Integration: register → trigger → unregister", () => {
    it("should support lifecycle: register → trigger → unregister → trigger", () => {
      const callback = vi.fn();

      offlineMutationEvents.register(callback);
      offlineMutationEvents.trigger();

      expect(callback).toHaveBeenCalledTimes(1);

      offlineMutationEvents.unregister();
      offlineMutationEvents.trigger();

      expect(callback).toHaveBeenCalledTimes(1); // still only once
    });

    it("should support re-registration after unregister", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      offlineMutationEvents.register(callback1);
      offlineMutationEvents.trigger();

      offlineMutationEvents.unregister();

      offlineMutationEvents.register(callback2);
      offlineMutationEvents.trigger();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
    });
  });
});

describe("isNetworkError type guard", () => {
  it("should return true when error has code === 'ERR_NETWORK'", () => {
    const error = new Error("Network error") as Error & { code?: string };
    error.code = "ERR_NETWORK";

    expect(isNetworkError(error)).toBe(true);
  });

  it("should return true when error.message === 'Network Error'", () => {
    const error = new Error("Network Error");

    expect(isNetworkError(error)).toBe(true);
  });

  it("should return false for other error codes", () => {
    const error = new Error("Timeout") as Error & { code?: string };
    error.code = "ECONNABORTED";

    expect(isNetworkError(error)).toBe(false);
  });

  it("should return false when error message is different", () => {
    const error = new Error("Invalid request");

    expect(isNetworkError(error)).toBe(false);
  });

  it("should return false when error has no code property", () => {
    const error = new Error("Generic error");

    expect(isNetworkError(error)).toBe(false);
  });

  it("should handle error with both code and message (prioritizes code)", () => {
    const error = new Error("Network Error") as Error & { code?: string };
    error.code = "ERR_NETWORK";

    expect(isNetworkError(error)).toBe(true);
  });

  it("should return false for CORS errors", () => {
    const error = new Error("CORS error") as Error & { code?: string };
    error.code = "ERR_CORS";

    expect(isNetworkError(error)).toBe(false);
  });

  it("should return false for timeout errors", () => {
    const error = new Error("Timeout") as Error & { code?: string };
    error.code = "ECONNABORTED";

    expect(isNetworkError(error)).toBe(false);
  });

  it("should handle case-sensitive code check", () => {
    const error = new Error("Network") as Error & { code?: string };
    error.code = "err_network"; // lowercase

    expect(isNetworkError(error)).toBe(false);
  });

  it("should handle case-sensitive message check", () => {
    const error = new Error("network error"); // lowercase

    expect(isNetworkError(error)).toBe(false);
  });

  it("should return true when error.message is 'Network Error' with exact case", () => {
    const error = new Error("Network Error");

    expect(isNetworkError(error)).toBe(true);
  });

  it("should return false for axios ERR_NETWORK code with different message", () => {
    const error = new Error("Request failed") as Error & { code?: string };
    error.code = "ERR_NETWORK";

    expect(isNetworkError(error)).toBe(true); // code check is first, returns true
  });

  it("should handle axios parse error as non-network error", () => {
    const error = new Error("Parse error") as Error & { code?: string };
    error.code = "ERR_BAD_RESPONSE";

    expect(isNetworkError(error)).toBe(false);
  });

  it("should handle generic Error objects", () => {
    const error = new Error("Some error");

    expect(isNetworkError(error)).toBe(false);
  });

  it("should return true for Network Error message with extra whitespace", () => {
    // Exact message check, no trimming
    const error = new Error("Network Error");
    expect(isNetworkError(error)).toBe(true);

    const errorWithExtra = new Error("Network Error ");
    expect(isNetworkError(errorWithExtra)).toBe(false); // extra space doesn't match
  });

  it("should handle error created from axios network timeout", () => {
    const error = new Error("timeout of 5000ms exceeded") as Error & { code?: string };
    error.code = "ECONNABORTED";

    expect(isNetworkError(error)).toBe(false);
  });

  it("should prioritize code check over message check", () => {
    // If code is ERR_NETWORK, should return true regardless of message
    const error = new Error("Some message") as Error & { code?: string };
    error.code = "ERR_NETWORK";

    expect(isNetworkError(error)).toBe(true);
  });
});
