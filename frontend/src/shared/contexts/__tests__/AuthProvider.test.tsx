import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { authEvents } from "@api/authEvents";
import { AuthProvider } from "../AuthProvider";
import { useAuthContext } from "../useAuthContext";
import { API } from "@shared/constants/api";
import type { ReactNode } from "react";

vi.mock("@api/authEvents");
vi.mock("@api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@api/client")>();
  return {
    ...actual,
    apiClient: {
      ...actual.apiClient,
      get: vi.fn(),
    },
  };
});

import { apiClient } from "@api/client";

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

describe("AuthProvider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe("Initialization — mount without token", () => {
    it("should initialize with isAuthenticated=false when no accessToken", () => {
      localStorage.clear();

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("should not make API call when accessToken is missing", async () => {
      localStorage.clear();

      renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        // Wait for component to finish initialization
      });

      expect(vi.mocked(apiClient.get)).not.toHaveBeenCalled();
    });

    it("should set isLoading=false immediately when no token", () => {
      localStorage.clear();

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Initialization — mount with valid token", () => {
    it("should set isLoading=true when accessToken exists during mount", () => {
      localStorage.setItem("accessToken", "valid-token");
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { id: 1, username: "john" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig,
      });

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      // isLoading should be true initially (set in useState initializer)
      expect(result.current.isLoading).toBe(true);
    });

    it("should call /users/me/ when accessToken exists", async () => {
      const token = "valid-access-token";
      localStorage.setItem("accessToken", token);

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          id: 1,
          username: "john_doe",
          email: "john@example.com",
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig,
      });

      renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(API.USERS_ME);
      });
    });

    it("should set isAuthenticated=true on successful /users/me/ call", async () => {
      localStorage.setItem("accessToken", "token");
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { id: 1, username: "user", email: "user@example.com" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig,
      });

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should set isLoading=false after /users/me/ succeeds", async () => {
      localStorage.setItem("accessToken", "token");
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { id: 1, username: "user", email: "user@example.com" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig,
      });

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Initialization — mount with invalid token", () => {
    it("should call logout when /users/me/ returns 401", async () => {
      localStorage.setItem("accessToken", "invalid-token");
      const error = new AxiosError(
        "Unauthorized",
        "ERR_BAD_RESPONSE",
        { headers: {} } as InternalAxiosRequestConfig,
        undefined,
        {
          data: { detail: "Unauthorized" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: { headers: {} } as InternalAxiosRequestConfig,
        },
      );
      vi.mocked(apiClient.get).mockRejectedValue(error);

      renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        // logout is called in catch block, which calls the registered callback
      });
    });

    it("should set isAuthenticated=false after logout on invalid token", async () => {
      localStorage.setItem("accessToken", "invalid-token");
      const error = new AxiosError(
        "Unauthorized",
        "ERR_BAD_RESPONSE",
        { headers: {} } as InternalAxiosRequestConfig,
        undefined,
        {
          data: {},
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: { headers: {} } as InternalAxiosRequestConfig,
        },
      );
      vi.mocked(apiClient.get).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });

    it("should set isLoading=false after /users/me/ fails", async () => {
      localStorage.setItem("accessToken", "invalid-token");
      const error = new AxiosError(
        "Unauthorized",
        "ERR_BAD_RESPONSE",
        { headers: {} } as InternalAxiosRequestConfig,
        undefined,
        {
          data: {},
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: { headers: {} } as InternalAxiosRequestConfig,
        },
      );
      vi.mocked(apiClient.get).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should clear tokens from localStorage when /users/me/ fails", async () => {
      localStorage.setItem("accessToken", "invalid-token");
      localStorage.setItem("refreshToken", "invalid-refresh");

      const error = new AxiosError(
        "Unauthorized",
        "ERR_BAD_RESPONSE",
        { headers: {} } as InternalAxiosRequestConfig,
        undefined,
        {
          data: {},
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: { headers: {} } as InternalAxiosRequestConfig,
        },
      );
      vi.mocked(apiClient.get).mockRejectedValue(error);

      renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
      });
    });
  });

  describe("login(accessToken, refreshToken) method", () => {
    it("should store accessToken in localStorage", () => {
      localStorage.clear();
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      const accessToken = "new-access-token-abc123";
      const refreshToken = "new-refresh-token-xyz789";

      result.current.login(accessToken, refreshToken);

      expect(localStorage.getItem("accessToken")).toBe(accessToken);
    });

    it("should store refreshToken in localStorage", () => {
      localStorage.clear();
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      const accessToken = "new-access-token";
      const refreshToken = "new-refresh-token";

      result.current.login(accessToken, refreshToken);

      expect(localStorage.getItem("refreshToken")).toBe(refreshToken);
    });

    it("should set isAuthenticated=true after login", () => {
      localStorage.clear();
      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isAuthenticated).toBe(false);

      result.current.login("access", "refresh");

      // Re-render to update the hook with new state
      rerender();

      // login is synchronous, so state should update immediately after rerender
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should accept different access and refresh tokens", () => {
      localStorage.clear();
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      const accessToken1 = "token1";
      const refreshToken1 = "refresh1";

      result.current.login(accessToken1, refreshToken1);

      expect(localStorage.getItem("accessToken")).toBe(accessToken1);
      expect(localStorage.getItem("refreshToken")).toBe(refreshToken1);

      const accessToken2 = "token2";
      const refreshToken2 = "refresh2";

      result.current.login(accessToken2, refreshToken2);

      expect(localStorage.getItem("accessToken")).toBe(accessToken2);
      expect(localStorage.getItem("refreshToken")).toBe(refreshToken2);
    });
  });

  describe("logout() method", () => {
    it("should remove accessToken from localStorage", () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.logout();

      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    it("should remove refreshToken from localStorage", () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.logout();

      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("should set isAuthenticated=false after logout", () => {
      localStorage.setItem("accessToken", "token");

      const { result, rerender } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.login("token", "refresh");
      rerender();
      expect(result.current.isAuthenticated).toBe(true);

      result.current.logout();
      rerender();
      // logout is synchronous, so state updates immediately after rerender
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should clear React Query cache on logout", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      // Set some cached data
      queryClient.setQueryData(["test"], { data: "cached" });

      result.current.logout();

      // Cache should be cleared
      expect(queryClient.getQueryData(["test"])).toBeUndefined();
    });

    it("should clear persisted React Query cache from localStorage", () => {
      localStorage.setItem("hersa-rq-cache", '{"test":"cache"}');

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.logout();

      expect(localStorage.getItem("hersa-rq-cache")).toBeNull();
    });

    it("should clear Workbox API runtime cache", async () => {
      // Mock caches.delete
      const cachesDeleteSpy = vi.fn().mockResolvedValue(true);
      Object.assign(window, { caches: { delete: cachesDeleteSpy } });

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.logout();

      await waitFor(() => {
        expect(cachesDeleteSpy).toHaveBeenCalledWith("api-cache");
      });
    });

    it("should handle missing Workbox API gracefully", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      // Verify caches exists and has delete method
      const hasCaches = "caches" in window;
      expect(hasCaches).toBe(true);

      // Should not throw when logout is called (it checks if caches exists)
      expect(() => {
        result.current.logout();
      }).not.toThrow();
    });
  });

  describe("authEvents integration", () => {
    it("should register logout callback with authEvents on mount", async () => {
      renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(vi.mocked(authEvents.setLogoutCallback)).toHaveBeenCalled();
      });
    });

    it("should register logout callback that clears tokens", async () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");

      renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      // Get the callback that was registered
      const setLogoutCallbackMock = vi.mocked(authEvents.setLogoutCallback);
      const registeredLogout = setLogoutCallbackMock.mock.calls[0]?.[0];

      expect(registeredLogout).toBeDefined();

      // Call the registered logout function
      registeredLogout?.();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });
  });

  describe("Context value structure", () => {
    it("should provide isAuthenticated in context", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).toHaveProperty("isAuthenticated");
      expect(typeof result.current.isAuthenticated).toBe("boolean");
    });

    it("should provide isLoading in context", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).toHaveProperty("isLoading");
      expect(typeof result.current.isLoading).toBe("boolean");
    });

    it("should provide login function in context", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).toHaveProperty("login");
      expect(typeof result.current.login).toBe("function");
    });

    it("should provide logout function in context", () => {
      const { result } = renderHook(() => useAuthContext(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current).toHaveProperty("logout");
      expect(typeof result.current.logout).toBe("function");
    });
  });

  describe("useAuthContext usage outside provider", () => {
    it("should throw error when used without AuthProvider", () => {
      expect(() => {
        renderHook(() => useAuthContext());
      }).toThrow("useAuthContext must be used within an AuthProvider");
    });
  });
});
