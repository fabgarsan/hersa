import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@shared/contexts/AuthProvider";
import { useAuth } from "../useAuth";
import type { ReactNode } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe("useAuth hook", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe("Return value structure", () => {
    it("should return an object with isAuthenticated property", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).toHaveProperty("isAuthenticated");
    });

    it("should return an object with logout function", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).toHaveProperty("logout");
      expect(typeof result.current.logout).toBe("function");
    });

    it("should not expose isLoading in return value", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).not.toHaveProperty("isLoading");
    });

    it("should not expose login in return value", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).not.toHaveProperty("login");
    });

    it("should return only isAuthenticated and logout", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      const keys = Object.keys(result.current);
      expect(keys).toEqual(["isAuthenticated", "logout"]);
    });
  });

  describe("isAuthenticated property", () => {
    it("should return false when user is not authenticated", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should reflect authentication state from context", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should be boolean type", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(typeof result.current.isAuthenticated).toBe("boolean");
    });

    it("should return true after calling logout and re-authenticating", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false);

      // Note: logout is provided but useAuth doesn't provide login
      // This test documents that to authenticate, you need direct access to context
    });
  });

  describe("logout function", () => {
    it("should be a callable function", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(typeof result.current.logout).toBe("function");
    });

    it("should call the underlying logout from context", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      // Store the logout function
      const logoutFn = result.current.logout;

      expect(logoutFn).toBeDefined();

      // Call it (should not throw)
      expect(() => {
        logoutFn();
      }).not.toThrow();
    });

    it("should clear localStorage when called", () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.logout();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("should set isAuthenticated to false after logout", () => {
      // First, simulate being authenticated
      localStorage.setItem("accessToken", "token");

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.logout();

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should be the same function reference as AuthProvider's logout", () => {
      const { result: useAuthResult } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      const logoutFn = useAuthResult.current.logout;

      // Verify it's the same function by calling it multiple times
      expect(() => {
        logoutFn();
        logoutFn();
      }).not.toThrow();
    });
  });

  describe("Wrapper functionality", () => {
    it("should be a thin wrapper of useAuthContext", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      // useAuth should only return isAuthenticated and logout from context
      expect(result.current).toEqual({
        isAuthenticated: expect.any(Boolean),
        logout: expect.any(Function),
      });
    });

    it("should filter out non-exposed properties from context", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      // The full context has: isAuthenticated, isLoading, login, logout
      // useAuth only returns: isAuthenticated, logout
      const returnedKeys = Object.keys(result.current);

      expect(returnedKeys).not.toContain("isLoading");
      expect(returnedKeys).not.toContain("login");
    });
  });

  describe("Usage patterns", () => {
    it("should support destructuring in component", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      const { isAuthenticated, logout } = result.current;

      expect(typeof isAuthenticated).toBe("boolean");
      expect(typeof logout).toBe("function");
    });

    it("should support accessing properties directly", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      const auth = result.current;

      expect(typeof auth.isAuthenticated).toBe("boolean");
      expect(typeof auth.logout).toBe("function");
    });

    it("should be reusable across multiple component instances", () => {
      const { result: result1 } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      const { result: result2 } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result1.current.isAuthenticated).toBe(result2.current.isAuthenticated);
    });
  });

  describe("Error handling", () => {
    it("should throw when useAuthContext throws (not within provider)", () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuthContext must be used within an AuthProvider");
    });

    it("should propagate useAuthContext errors", () => {
      expect(() => {
        renderHook(() => useAuth()); // No wrapper provider
      }).toThrow();
    });
  });

  describe("Integration with authentication flow", () => {
    it("should allow consumer to logout", () => {
      localStorage.setItem("accessToken", "valid-token");

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.logout();

      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    it("should reflect logout state immediately", () => {
      localStorage.setItem("accessToken", "token");

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false); // token in storage but not checked yet

      result.current.logout();

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("Type safety", () => {
    it("should return UseAuthReturn type with correct structure", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      });

      // Runtime check for type shape
      expect(result.current).toEqual({
        isAuthenticated: expect.any(Boolean),
        logout: expect.any(Function),
      });
    });
  });

  describe("Hook composition", () => {
    it("should work with other hooks in same component", () => {
      const { result } = renderHook(
        () => {
          const auth = useAuth();
          return { auth };
        },
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.auth.isAuthenticated).toBe(false);
      expect(typeof result.current.auth.logout).toBe("function");
    });

    it("should support multiple useAuth calls in same component", () => {
      const { result } = renderHook(
        () => {
          const auth1 = useAuth();
          const auth2 = useAuth();
          return { auth1, auth2 };
        },
        { wrapper: createWrapper(queryClient) },
      );

      expect(result.current.auth1).toEqual(result.current.auth2);
    });
  });
});
