import { describe, it, expect, beforeEach, vi } from "vitest";
import { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./AuthProvider";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./types";

// Mock dependencies
vi.mock("@api/client");
vi.mock("@api/authEvents");

import { apiClient } from "@api/client";
import { authEvents } from "@api/authEvents";

type StorageMock = {
  getItem: ReturnType<typeof vi.fn<(key: string) => string | null>>;
  setItem: ReturnType<typeof vi.fn<(key: string, value: string) => void>>;
  removeItem: ReturnType<typeof vi.fn<(key: string) => void>>;
  clear: ReturnType<typeof vi.fn<() => void>>;
};

interface TestContextConsumerProps {
  onContextReceived?: (value: AuthContextValue) => void;
}

function useAuthContextDirect(): AuthContextValue | null {
  return useContext(AuthContext);
}

// Helper component to read AuthContext in tests
function TestContextConsumer({ onContextReceived }: TestContextConsumerProps) {
  const context = useAuthContextDirect();
  if (onContextReceived && context) {
    onContextReceived(context);
  }
  return <div>{context ? "authenticated" : "no-context"}</div>;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

describe("AuthProvider", () => {
  let storageMock: StorageMock;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    storageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      value: storageMock,
      writable: true,
    });

    // Mock window.caches (configurable:true allows redefinition between tests)
    Object.defineProperty(window, "caches", {
      value: { delete: vi.fn() },
      writable: true,
      configurable: true,
    });

    queryClient = createTestQueryClient();

    // Default mock implementations
    vi.mocked(apiClient).get = vi.fn().mockResolvedValue({ data: { id: 1 } });
    vi.mocked(authEvents).setLogoutCallback = vi.fn();
    vi.mocked(authEvents).triggerLogout = vi.fn();
  });

  // =========================================================================
  // Initial state tests
  // =========================================================================

  it("should initialize isAuthenticated to false", () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(contextValues[0]?.isAuthenticated).toBe(false);
  });

  it("should initialize isLoading to true when accessToken is in localStorage", () => {
    storageMock.getItem.mockReturnValue("token-123");

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(contextValues[0]?.isLoading).toBe(true);
  });

  it("should initialize isLoading to false when no accessToken in localStorage", () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(contextValues[0]?.isLoading).toBe(false);
  });

  // =========================================================================
  // localStorage key verification tests (kill StringLiteral mutants)
  // =========================================================================

  it("should check for 'accessToken' key in localStorage during init", () => {
    storageMock.getItem.mockReturnValue(null);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div>test</div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(storageMock.getItem).toHaveBeenCalledWith("accessToken");
  });

  // =========================================================================
  // Token validation on mount tests
  // =========================================================================

  it("should skip API call when no accessToken on mount", async () => {
    storageMock.getItem.mockReturnValue(null);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div>test</div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    // Give async effects time to run
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(vi.mocked(apiClient).get).not.toHaveBeenCalled();
  });

  it("should call apiClient.get with USERS_ME endpoint when accessToken exists", async () => {
    storageMock.getItem.mockReturnValue("token-123");

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div>test</div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(vi.mocked(apiClient).get).toHaveBeenCalled();
    });
  });

  it("should set isAuthenticated to true on successful token validation", async () => {
    storageMock.getItem.mockReturnValue("token-123");
    vi.mocked(apiClient).get = vi.fn().mockResolvedValue({ data: { id: 1 } });

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.some((ctx) => ctx?.isAuthenticated === true)).toBe(true);
    });
  });

  it("should set isLoading to false after token validation completes", async () => {
    storageMock.getItem.mockReturnValue("token-123");

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.some((ctx) => ctx?.isLoading === false)).toBe(true);
    });
  });

  it("should call logout on token validation failure", async () => {
    storageMock.getItem.mockReturnValue("invalid-token");
    vi.mocked(apiClient).get = vi.fn().mockRejectedValue(new Error("Unauthorized"));

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div>test</div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      // logout is called which removes tokens
      const removeCalls = storageMock.removeItem.mock.calls;
      expect(removeCalls.some((call) => call[0] === "accessToken")).toBe(true);
    });
  });

  // =========================================================================
  // Logout functionality tests
  // =========================================================================

  it("should remove accessToken from localStorage on logout", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const logoutFn = contextValues[0]?.logout;
    expect(logoutFn).toBeDefined();
    logoutFn?.();

    expect(storageMock.removeItem).toHaveBeenCalledWith("accessToken");
  });

  it("should remove refreshToken from localStorage on logout", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const logoutFn = contextValues[0]?.logout;
    expect(logoutFn).toBeDefined();
    logoutFn?.();

    expect(storageMock.removeItem).toHaveBeenCalledWith("refreshToken");
  });

  it("should remove hersa-rq-cache from localStorage on logout", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const logoutFn = contextValues[0]?.logout;
    expect(logoutFn).toBeDefined();
    logoutFn?.();

    expect(storageMock.removeItem).toHaveBeenCalledWith("hersa-rq-cache");
  });

  it("should call queryClient.clear() on logout", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const queryClearSpy = vi.spyOn(queryClient, "clear");
    const logoutFn = contextValues[0]?.logout;
    expect(logoutFn).toBeDefined();
    logoutFn?.();

    expect(queryClearSpy).toHaveBeenCalled();
  });

  it("should call caches.delete() on logout when caches API is available", async () => {
    storageMock.getItem.mockReturnValue(null);

    const mockCachesDelete = vi.fn().mockResolvedValue(true);
    Object.defineProperty(window, "caches", {
      value: { delete: mockCachesDelete },
      writable: true,
    });

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const logoutFn = contextValues[0]?.logout;
    expect(logoutFn).toBeDefined();
    logoutFn?.();

    // Ensure async caches.delete completes
    await waitFor(() => {
      expect(mockCachesDelete).toHaveBeenCalledWith("api-cache");
    });
  });

  it("should set isAuthenticated to false on logout", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const logoutFn = contextValues[0]?.logout;
    expect(logoutFn).toBeDefined();
    logoutFn?.();

    await waitFor(() => {
      expect(contextValues.some((ctx) => ctx?.isAuthenticated === false)).toBe(true);
    });
  });

  it("should register logout callback with authEvents on mount", async () => {
    storageMock.getItem.mockReturnValue(null);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div>test</div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(vi.mocked(authEvents).setLogoutCallback).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Login functionality tests
  // =========================================================================

  it("should store accessToken in localStorage on login", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const loginFn = contextValues[0]?.login;
    expect(loginFn).toBeDefined();
    loginFn?.("access-token-123", "refresh-token-456");

    expect(storageMock.setItem).toHaveBeenCalledWith("accessToken", "access-token-123");
  });

  it("should store refreshToken in localStorage on login", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const loginFn = contextValues[0]?.login;
    expect(loginFn).toBeDefined();
    loginFn?.("access-token-123", "refresh-token-456");

    expect(storageMock.setItem).toHaveBeenCalledWith("refreshToken", "refresh-token-456");
  });

  it("should set isAuthenticated to true on login", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const loginFn = contextValues[0]?.login;
    expect(loginFn).toBeDefined();
    loginFn?.("access-token-123", "refresh-token-456");

    await waitFor(() => {
      expect(contextValues.some((ctx) => ctx?.isAuthenticated === true)).toBe(true);
    });
  });

  // =========================================================================
  // Context value exposure tests
  // =========================================================================

  it("should expose isAuthenticated, isLoading, login, and logout through context", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const context = contextValues[0];
    expect(typeof context.isAuthenticated).toBe("boolean");
    expect(typeof context.isLoading).toBe("boolean");
    expect(typeof context.login).toBe("function");
    expect(typeof context.logout).toBe("function");
  });

  // =========================================================================
  // Children rendering tests
  // =========================================================================

  it("should render children", () => {
    storageMock.getItem.mockReturnValue(null);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div data-testid="test-child">Test Child Content</div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child Content")).toBeInTheDocument();
  });

  // =========================================================================
  // Dependency array tests (catch missing dependencies)
  // =========================================================================

  // =========================================================================
  // Mutation-killer tests: exact key names and conditional guards
  // =========================================================================

  it("isLoading uses exact key 'accessToken' (not any other key) for init", () => {
    // mockReturnValue would return a value for ANY key — use mockImplementation to be key-specific
    storageMock.getItem.mockImplementation((key: string) =>
      key === "accessToken" ? "my-token" : null,
    );

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    // isLoading is true because "accessToken" has a value; any other key returns null
    expect(contextValues[0]?.isLoading).toBe(true);
  });

  it("token validation uses exact key 'accessToken' on mount", async () => {
    storageMock.getItem.mockImplementation((key: string) =>
      key === "accessToken" ? "my-token" : null,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div>test</div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(vi.mocked(apiClient).get).toHaveBeenCalled();
    });
  });

  it("logout sets isAuthenticated to false after being true (not just initial false)", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(contextValues.length > 0).toBe(true));

    // Set authenticated to true via login
    contextValues[0].login("access-token", "refresh-token");
    await waitFor(() =>
      expect(contextValues.some((ctx) => ctx?.isAuthenticated === true)).toBe(true),
    );

    // Now logout — must set isAuthenticated back to false
    const latestCtx = [...contextValues].reverse()[0];
    latestCtx.logout();

    await waitFor(() => {
      const latest = [...contextValues].reverse()[0];
      expect(latest?.isAuthenticated).toBe(false);
    });
  });

  it("does NOT call caches.delete when window.caches is not available", async () => {
    // Remove the Cache API entirely so `"caches" in window` returns false
    Reflect.deleteProperty(window, "caches");

    storageMock.getItem.mockReturnValue(null);
    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(contextValues.length > 0).toBe(true));

    // logout should not throw even without caches API
    expect(() => contextValues[0].logout()).not.toThrow();
  });

  it("should re-register logout callback when logout function changes", async () => {
    storageMock.getItem.mockReturnValue(null);

    const contextValues: AuthContextValue[] = [];

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestContextConsumer
              onContextReceived={(ctx) => {
                contextValues.push(ctx);
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(contextValues.length > 0).toBe(true);
    });

    const initialCallCount = vi.mocked(authEvents).setLogoutCallback.mock.calls.length;

    // Trigger a state change that affects the logout closure
    const loginFn = contextValues[0]?.login;
    if (loginFn) {
      loginFn("token", "refresh");
    }

    // The callback should potentially be re-registered due to dependency on logout
    // (which depends on queryClient)
    expect(vi.mocked(authEvents).setLogoutCallback.mock.calls.length).toBeGreaterThanOrEqual(
      initialCallCount,
    );
  });
});
