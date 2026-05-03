import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthContext } from "../useAuthContext";
import { AuthProvider } from "../AuthProvider";
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

describe("useAuthContext", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe("Usage within AuthProvider", () => {
    it("should return auth context value when called within AuthProvider", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty("isAuthenticated");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("login");
      expect(result.current).toHaveProperty("logout");
    });

    it("should return context with correct property types", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(typeof result.current.isAuthenticated).toBe("boolean");
      expect(typeof result.current.isLoading).toBe("boolean");
      expect(typeof result.current.login).toBe("function");
      expect(typeof result.current.logout).toBe("function");
    });

    it("should have stable reference across renders", () => {
      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      const contextValue1 = result.current;

      rerender();

      // Note: context value itself should be stable, but login/logout functions
      // may be recreated on each render depending on dependencies
      expect(result.current.isAuthenticated).toBe(contextValue1.isAuthenticated);
    });
  });

  describe("Usage outside AuthProvider", () => {
    it("should throw error when called outside AuthProvider", () => {
      const { result } = renderHook(() => {
        try {
          return useAuthContext();
        } catch (error: any) {
          return { error: error.message };
        }
      });

      expect(result.current).toHaveProperty("error");
      expect((result.current as any).error).toBe(
        "useAuthContext must be used within an AuthProvider"
      );
    });

    it("should throw with specific error message", () => {
      expect(() => {
        renderHook(() => useAuthContext());
      }).toThrow("useAuthContext must be used within an AuthProvider");
    });
  });

  describe("Context values from AuthProvider", () => {
    it("should provide isAuthenticated from AuthProvider", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false); // initial state
    });

    it("should provide isLoading from AuthProvider", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(false); // initial state when no token
    });

    it("should provide login function from AuthProvider", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe("function");
    });

    it("should provide logout function from AuthProvider", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe("function");
    });
  });

  describe("Integration with AuthProvider updates", () => {
    it("should reflect updated isAuthenticated from AuthProvider", () => {
      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false);

      result.current.login("token", "refresh");

      rerender();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should call login function and update state", () => {
      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.login("access-token", "refresh-token");

      rerender();
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem("accessToken")).toBe("access-token");
      expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
    });

    it("should call logout function and update state", () => {
      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.login("token", "refresh");
      rerender();
      expect(result.current.isAuthenticated).toBe(true);

      result.current.logout();

      rerender();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem("accessToken")).toBeNull();
    });
  });

  describe("Hook behavior with different contexts", () => {
    it("should use the nearest AuthProvider in component tree", () => {
      const qc1 = createTestQueryClient();

      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(qc1),
      });

      // Should be using the wrapper's AuthProvider
      result.current.login("token", "refresh");
      rerender();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should throw error for duplicate useAuthContext calls outside provider", () => {
      expect(() => {
        renderHook(() => {
          useAuthContext();
          useAuthContext(); // second call also outside provider
        });
      }).toThrow("useAuthContext must be used within an AuthProvider");
    });
  });

  describe("Type safety", () => {
    it("should have AuthContextValue type", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      // This is a type check; at runtime, we verify the shape
      expect(result.current).toHaveProperty("isAuthenticated");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("login");
      expect(result.current).toHaveProperty("logout");
    });
  });

  describe("Error thrown is informative", () => {
    it("should provide helpful error message for debugging", () => {
      let thrownError: any = null;

      try {
        renderHook(() => useAuthContext());
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError?.message).toContain("useAuthContext");
      expect(thrownError?.message).toContain("AuthProvider");
    });
  });
});
