import MockAdapter from "axios-mock-adapter";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios from "axios";
import { apiClient, isApiErrorData } from "../client";
import { authEvents } from "../authEvents";

vi.mock("../authEvents");

// Intercepts requests on the actual apiClient instance (with its registered interceptors)
let mock: MockAdapter;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

// ─── isApiErrorData type guard ───────────────────────────────────────────────

describe("isApiErrorData", () => {
  it("returns true for any non-null object", () => {
    expect(isApiErrorData({})).toBe(true);
    expect(isApiErrorData({ error: "oops" })).toBe(true);
    expect(isApiErrorData({ detail: "not found" })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isApiErrorData(null)).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(isApiErrorData("string")).toBe(false);
    expect(isApiErrorData(42)).toBe(false);
    expect(isApiErrorData(true)).toBe(false);
    expect(isApiErrorData(undefined)).toBe(false);
  });

  it("returns false for functions", () => {
    expect(isApiErrorData(() => {})).toBe(false);
  });

  it("returns true for arrays (typeof === 'object')", () => {
    expect(isApiErrorData([])).toBe(true);
  });
});

// ─── Base config ─────────────────────────────────────────────────────────────

describe("apiClient base config", () => {
  it("is an axios instance with standard methods", () => {
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
    expect(apiClient.put).toBeDefined();
    expect(apiClient.delete).toBeDefined();
    expect(apiClient.patch).toBeDefined();
  });

  it("sends Content-Type: application/json by default", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });
});

// ─── Request interceptor — JWT attachment ────────────────────────────────────

describe("request interceptor — JWT attachment", () => {
  it("does not set Authorization header when no accessToken in localStorage", async () => {
    let capturedHeaders: Record<string, string> | undefined;
    mock.onGet("/test").reply((config) => {
      capturedHeaders = config.headers as Record<string, string>;
      return [200, {}];
    });

    await apiClient.get("/test");

    expect(capturedHeaders?.Authorization).toBeUndefined();
  });

  it("sets Authorization: Bearer <token> when accessToken is present", async () => {
    localStorage.setItem("accessToken", "tok-abc-123");
    let capturedHeaders: Record<string, string> | undefined;
    mock.onGet("/test").reply((config) => {
      capturedHeaders = config.headers as Record<string, string>;
      return [200, {}];
    });

    await apiClient.get("/test");

    expect(capturedHeaders?.Authorization).toBe("Bearer tok-abc-123");
  });
});

// ─── Request interceptor — camelCase → snake_case ────────────────────────────

describe("request interceptor — camelCase to snake_case", () => {
  it("converts camelCase body keys to snake_case before sending", async () => {
    let capturedBody: unknown;
    mock.onPost("/data").reply((config) => {
      capturedBody = JSON.parse(config.data as string);
      return [201, {}];
    });

    await apiClient.post("/data", { newPassword: "s3cr3t", confirmPassword: "s3cr3t" });

    expect(capturedBody).toEqual({ new_password: "s3cr3t", confirm_password: "s3cr3t" });
  });

  it("converts nested camelCase objects deeply", async () => {
    let capturedBody: unknown;
    mock.onPost("/nested").reply((config) => {
      capturedBody = JSON.parse(config.data as string);
      return [201, {}];
    });

    await apiClient.post("/nested", { userInfo: { firstName: "Ana", lastName: "García" } });

    expect(capturedBody).toEqual({ user_info: { first_name: "Ana", last_name: "García" } });
  });

  it("does not alter requests with no body", async () => {
    let capturedBody: unknown;
    mock.onGet("/no-body").reply((config) => {
      capturedBody = config.data;
      return [200, {}];
    });

    await apiClient.get("/no-body");

    expect(capturedBody).toBeUndefined();
  });
});

// ─── Response interceptor — snake_case → camelCase ───────────────────────────

describe("response interceptor — snake_case to camelCase", () => {
  it("converts snake_case response keys to camelCase", async () => {
    mock.onGet("/me").reply(200, { first_name: "Ana", last_name: "García", user_id: 7 });

    const { data } = await apiClient.get("/me");

    expect(data).toEqual({ firstName: "Ana", lastName: "García", userId: 7 });
  });

  it("converts nested snake_case deeply", async () => {
    mock.onGet("/nested").reply(200, { user_profile: { display_name: "Ana G." } });

    const { data } = await apiClient.get("/nested");

    expect(data).toEqual({ userProfile: { displayName: "Ana G." } });
  });

  it("passes responses with no body through unchanged", async () => {
    mock.onDelete("/item/1").reply(204, null);

    const response = await apiClient.delete("/item/1");

    expect(response.status).toBe(204);
  });
});

// ─── Response interceptor — 401 handling ─────────────────────────────────────

describe("401 error handler", () => {
  it("rejects immediately when no refreshToken is stored", async () => {
    mock.onGet("/protected").reply(401);

    await expect(apiClient.get("/protected")).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it("calls triggerLogout and rejects when refresh request fails", async () => {
    localStorage.setItem("refreshToken", "expired-refresh");
    mock.onGet("/protected").reply(401);
    // Simulate a failed refresh call using plain axios (not apiClient)
    vi.spyOn(axios, "post").mockRejectedValueOnce(new Error("refresh failed"));

    await expect(apiClient.get("/protected")).rejects.toBeDefined();

    expect(vi.mocked(authEvents.triggerLogout)).toHaveBeenCalledTimes(1);
  });

  it("stores new accessToken after successful refresh", async () => {
    localStorage.setItem("refreshToken", "valid-refresh");
    mock.onGet("/protected").replyOnce(401).onGet("/protected").reply(200, { ok: true });
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: { access: "new-access-token", refresh: "new-refresh-token" },
    });

    await apiClient.get("/protected");

    expect(localStorage.getItem("accessToken")).toBe("new-access-token");
  });

  it("stores new refreshToken when server returns one", async () => {
    localStorage.setItem("refreshToken", "old-refresh");
    mock.onGet("/protected").replyOnce(401).onGet("/protected").reply(200, {});
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: { access: "new-acc", refresh: "new-refresh" },
    });

    await apiClient.get("/protected");

    expect(localStorage.getItem("refreshToken")).toBe("new-refresh");
  });

  it("retries the original request with the new token after refresh succeeds", async () => {
    localStorage.setItem("refreshToken", "valid-refresh");
    mock.onGet("/protected").replyOnce(401).onGet("/protected").reply(200, { result: "ok" });
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: { access: "retried-token" },
    });

    const { data } = await apiClient.get("/protected");

    expect(data).toEqual({ result: "ok" });
  });

  it("prevents loop: _retry flag stops a second 401 from triggering another refresh", async () => {
    localStorage.setItem("refreshToken", "valid-refresh");
    // Both the first and the retried request return 401
    mock.onGet("/protected").reply(401);
    vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: { access: "new-token" },
    });

    await expect(apiClient.get("/protected")).rejects.toMatchObject({
      response: { status: 401 },
    });
    // Refresh should only be attempted once
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("uses a single refresh call when concurrent 401s arrive (mutex)", async () => {
    localStorage.setItem("refreshToken", "shared-refresh");
    mock
      .onGet("/a").replyOnce(401).onGet("/a").reply(200, {})
      .onGet("/b").replyOnce(401).onGet("/b").reply(200, {});

    let refreshCallCount = 0;
    vi.spyOn(axios, "post").mockImplementation(async () => {
      refreshCallCount++;
      // Simulate network delay so both concurrent calls hit the mutex
      await new Promise((r) => setTimeout(r, 10));
      return { data: { access: "shared-new-token" } };
    });

    await Promise.all([apiClient.get("/a"), apiClient.get("/b")]);

    expect(refreshCallCount).toBe(1);
  });
});
