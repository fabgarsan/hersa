import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { ReactNode } from "react";
import type { GridSortItem } from "@mui/x-data-grid";

import { useOnlineStatus } from "./useOnlineStatus";
import { usePermissions } from "./usePermissions";
import { useDrfAdapter } from "./useDrfAdapter";
import type { DrfPaginatedResponse, DrfQueryParams } from "./types";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

// ---------------------------------------------------------------------------
// useOnlineStatus
// ---------------------------------------------------------------------------

describe("useOnlineStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when navigator.onLine is true", () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("should return false when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: false });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it("should update to true when online event fires", () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: false });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });

  it("should update to false when offline event fires", () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
  });

  it("should handle multiple online/offline transitions", () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
  });

  it("should remove event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
  });

  it("should not update state when online event fires after unmount", () => {
    Object.defineProperty(navigator, "onLine", { writable: true, value: false });
    const { result, unmount } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    unmount();
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// usePermissions
// ---------------------------------------------------------------------------

describe("usePermissions", () => {
  let qc: QueryClient;
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    qc = createTestQueryClient();
    wrapper = createWrapper(qc);
  });

  it("should return hasAccess function and permissions array", () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    expect(typeof result.current.hasAccess).toBe("function");
    expect(Array.isArray(result.current.permissions)).toBe(true);
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("hasAccess should return false when isLoading", () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    expect(result.current.hasAccess("any_permission")).toBe(false);
  });

  it("should return true for hasAccess when permission is granted", async () => {
    qc.setQueryData(["permissions", "me"], ["users.view_user", "users.list_user"]);
    const { result } = renderHook(() => usePermissions(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.hasAccess("users.view_user")).toBe(true);
    expect(result.current.permissions).toEqual(["users.view_user", "users.list_user"]);
  });

  it("should return false for hasAccess when permission is not granted", async () => {
    qc.setQueryData(["permissions", "me"], ["users.view_user", "users.list_user"]);
    const { result } = renderHook(() => usePermissions(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.hasAccess("users.edit_user")).toBe(false);
  });

  it("should return empty array and hasAccess false when data is undefined and not loading", async () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.permissions).toEqual([]);
    expect(result.current.hasAccess("any.permission")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// useDrfAdapter
// ---------------------------------------------------------------------------

describe("useDrfAdapter", () => {
  interface TestRow {
    id: string;
    name: string;
    email: string;
  }
  type QueryFn = (params: DrfQueryParams) => Promise<DrfPaginatedResponse<TestRow>>;

  let mockQueryFn: ReturnType<typeof vi.fn<QueryFn>> = vi.fn<QueryFn>();

  beforeEach(() => {
    mockQueryFn = vi.fn<QueryFn>();
    vi.clearAllMocks();
  });

  function emptyPage(count = 0): DrfPaginatedResponse<TestRow> {
    return { count, next: null, previous: null, results: [] };
  }

  function renderAdapter(initialPageSize?: number) {
    const qc = createTestQueryClient();
    const wrapper = createWrapper(qc);
    return renderHook(
      () => useDrfAdapter<TestRow>({ queryFn: mockQueryFn, queryKey: ["test"], initialPageSize }),
      { wrapper },
    );
  }

  function lastQueryParams(): DrfQueryParams {
    const calls = mockQueryFn.mock.calls;
    return calls[calls.length - 1][0] as DrfQueryParams;
  }

  it("should initialize with page=0, pageSize=10, and default sort/search", () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.sortModel).toEqual([]);
    expect(result.current.searchValue).toBe("");
  });

  it("should use custom initialPageSize", () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter(25);
    expect(result.current.pageSize).toBe(25);
  });

  it("should return empty rows and totalCount=0 when no data", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.rows).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });
  });

  it("should return rows and totalCount from response", async () => {
    const mockRows: TestRow[] = [
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
    ];
    mockQueryFn.mockResolvedValue({ count: 2, next: null, previous: null, results: mockRows });
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.rows).toEqual(mockRows);
      expect(result.current.totalCount).toBe(2);
      expect(result.current.error).toBe(null);
    });
  });

  it("should pass error from queryFn to error property", async () => {
    mockQueryFn.mockRejectedValue(new Error("network error"));
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
      expect(result.current.error instanceof Error).toBe(true);
      expect(result.current.error?.message).toBe("network error");
    });
  });

  it("should convert 0-based page to 1-based DRF page parameter", async () => {
    mockQueryFn.mockResolvedValue(emptyPage(100));
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onPageChange(2);
    });
    await waitFor(() => {
      expect(lastQueryParams().page).toBe(3);
    });
  });

  it("should handle pageSize parameter", async () => {
    mockQueryFn.mockResolvedValue(emptyPage(100));
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onPageSizeChange(25);
    });
    await waitFor(() => {
      expect(lastQueryParams().pageSize).toBe(25);
    });
  });

  it("onPageSizeChange should reset page to 0", async () => {
    mockQueryFn.mockResolvedValue(emptyPage(100));
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onPageChange(3);
    });
    await waitFor(() => {
      expect(result.current.page).toBe(3);
    });
    act(() => {
      result.current.onPageSizeChange(25);
    });
    expect(result.current.page).toBe(0);
  });

  it("should build ordering string from sort model ascending", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onSortChange([{ field: "name", sort: "asc" }]);
    });
    await waitFor(() => {
      expect(lastQueryParams().ordering).toBe("name");
    });
  });

  it("should build ordering string from sort model descending", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onSortChange([{ field: "email", sort: "desc" }]);
    });
    await waitFor(() => {
      expect(lastQueryParams().ordering).toBe("-email");
    });
  });

  it("should build ordering string with multiple sort fields", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    const sortModel: GridSortItem[] = [
      { field: "name", sort: "asc" },
      { field: "email", sort: "desc" },
    ];
    act(() => {
      result.current.onSortChange(sortModel);
    });
    await waitFor(() => {
      expect(lastQueryParams().ordering).toBe("name,-email");
    });
  });

  it("onSortChange should reset page to 0", async () => {
    mockQueryFn.mockResolvedValue(emptyPage(100));
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onPageChange(2);
    });
    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });
    act(() => {
      result.current.onSortChange([{ field: "name", sort: "asc" }]);
    });
    expect(result.current.page).toBe(0);
  });

  it("should clear ordering when sort model is emptied", async () => {
    mockQueryFn.mockResolvedValue(emptyPage(100));
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onSortChange([{ field: "name", sort: "asc" }]);
    });
    await waitFor(() => {
      expect(lastQueryParams().ordering).toBe("name");
    });
    act(() => {
      result.current.onSortChange([]);
    });
    await waitFor(() => {
      expect(lastQueryParams().ordering).toBeUndefined();
    });
  });

  it("should set searchValue immediately on onSearchChange", () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    act(() => {
      result.current.onSearchChange("alice");
    });
    expect(result.current.searchValue).toBe("alice");
  });

  it("should debounce search value by 300ms before triggering query", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    const initialCallCount = mockQueryFn.mock.calls.length;
    act(() => {
      result.current.onSearchChange("a");
    });
    expect(result.current.searchValue).toBe("a");
    await waitFor(
      () => {
        expect(mockQueryFn.mock.calls.length).toBeGreaterThan(initialCallCount);
      },
      { timeout: 500 },
    );
  }, 10000);

  it("should reset page to 0 when search is debounced", async () => {
    mockQueryFn.mockResolvedValue(emptyPage(100));
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onPageChange(2);
    });
    expect(result.current.page).toBe(2);
    act(() => {
      result.current.onSearchChange("test");
    });
    await waitFor(
      () => {
        expect(result.current.page).toBe(0);
      },
      { timeout: 500 },
    );
  });

  it("should pass search parameter only when debouncedSearch is not empty", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(lastQueryParams().search).toBeUndefined();
    act(() => {
      result.current.onSearchChange("alice");
    });
    await waitFor(
      () => {
        expect(lastQueryParams().search).toBe("alice");
      },
      { timeout: 500 },
    );
  });

  it("should clear search parameter when search value is cleared", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const { result } = renderAdapter();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.onSearchChange("alice");
    });
    await waitFor(
      () => {
        expect(lastQueryParams().search).toBe("alice");
      },
      { timeout: 500 },
    );
    act(() => {
      result.current.onSearchChange("");
    });
    await waitFor(
      () => {
        expect(lastQueryParams().search).toBeUndefined();
      },
      { timeout: 500 },
    );
  });

  it("should debounce multi-keystroke search and only call with final value", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    vi.useFakeTimers();
    try {
      const { result } = renderAdapter();
      act(() => {
        vi.advanceTimersByTime(0);
      });
      const initialCallCount = mockQueryFn.mock.calls.length;
      act(() => {
        result.current.onSearchChange("a");
      });
      act(() => {
        result.current.onSearchChange("ab");
      });
      act(() => {
        result.current.onSearchChange("abc");
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(mockQueryFn.mock.calls.length).toBeGreaterThan(initialCallCount);
      expect(lastQueryParams().search).toBe("abc");
      const staleSearchCalls = mockQueryFn.mock.calls.filter(
        (call) => call[0].search === "a" || call[0].search === "ab",
      );
      expect(staleSearchCalls.length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("should accept string queryKey and convert to array", async () => {
    mockQueryFn.mockResolvedValue(emptyPage());
    const qc = createTestQueryClient();
    const wrapper = createWrapper(qc);
    const { result } = renderHook(
      () =>
        useDrfAdapter<TestRow>({ queryFn: mockQueryFn, queryKey: "items" as unknown as string[] }),
      { wrapper },
    );
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 2000 },
    );
    expect(result.current.rows).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it("should not reset page when advancing to a later page", async () => {
    mockQueryFn.mockResolvedValue(emptyPage(100));
    const { result } = renderAdapter();
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 2000 },
    );
    act(() => {
      result.current.onPageChange(2);
    });
    expect(result.current.page).toBe(2);
    act(() => {
      result.current.onPageChange(4);
    });
    expect(result.current.page).toBe(4);
  });
});
