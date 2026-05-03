import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { apiClient, isApiErrorData } from "./client";
import * as authEventsModule from "./authEvents";
import { API } from "@shared/constants/api";

// MockAdapter attaches at the transport level, below interceptors.
// Interceptors still execute; mock adapter provides fake network responses.
const mock = new MockAdapter(apiClient);

describe("isApiErrorData", () => {
  it("returns true for plain objects", () => {
    expect(isApiErrorData({})).toBe(true);
    expect(isApiErrorData({ error: "message" })).toBe(true);
  });

  it("returns false for null (typeof null === 'object' guard)", () => {
    expect(isApiErrorData(null)).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(isApiErrorData("string")).toBe(false);
    expect(isApiErrorData(123)).toBe(false);
    expect(isApiErrorData(true)).toBe(false);
    expect(isApiErrorData(undefined)).toBe(false);
  });

  it("returns true for arrays (objects in JS)", () => {
    expect(isApiErrorData([])).toBe(true);
  });
});

describe("apiClient request interceptor", () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("attaches Authorization header when accessToken exists", async () => {
    localStorage.setItem("accessToken", "my-jwt-token");
    mock.onGet("/test").reply(200, {});
    await apiClient.get("/test");
    expect(mock.history.get[0].headers?.Authorization).toBe("Bearer my-jwt-token");
  });

  it("does not attach Authorization header when no accessToken", async () => {
    mock.onGet("/test").reply(200, {});
    await apiClient.get("/test");
    expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
  });

  it("converts camelCase request body to snake_case (deep)", async () => {
    mock.onPost("/test").reply(200, {});
    await apiClient.post("/test", {
      firstName: "John",
      addressData: { streetName: "Main St" },
    });
    const requestData = JSON.parse(mock.history.post[0].data as string);
    expect(requestData).toEqual({
      first_name: "John",
      address_data: { street_name: "Main St" },
    });
  });

  it("passes through when config.data is absent", async () => {
    mock.onGet("/test").reply(200, {});
    await apiClient.get("/test");
    expect(mock.history.get[0].data).toBeUndefined();
  });
});

describe("apiClient response interceptor — success", () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("converts snake_case response data to camelCase", async () => {
    mock.onGet("/test").reply(200, { first_name: "John", last_name: "Doe" });
    const response = await apiClient.get("/test");
    expect(response.data).toEqual({ firstName: "John", lastName: "Doe" });
  });

  it("converts nested snake_case keys deep", async () => {
    mock.onGet("/test").reply(200, {
      user_data: { first_name: "John", birth_date: "2000-01-01" },
    });
    const response = await apiClient.get("/test");
    expect(response.data).toEqual({
      userData: { firstName: "John", birthDate: "2000-01-01" },
    });
  });

  it("passes through 204 response without data", async () => {
    mock.onGet("/test").reply(204);
    const response = await apiClient.get("/test");
    expect(response.status).toBe(204);
  });
});

describe("apiClient response interceptor — 401 handling", () => {
  let postSpy: ReturnType<typeof vi.spyOn<typeof axios, "post">>;
  let triggerLogoutSpy: ReturnType<
    typeof vi.spyOn<typeof authEventsModule.authEvents, "triggerLogout">
  >;

  beforeEach(() => {
    mock.reset();
    localStorage.clear();
    vi.clearAllMocks();
    postSpy = vi.spyOn(axios, "post");
    triggerLogoutSpy = vi.spyOn(authEventsModule.authEvents, "triggerLogout");
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Security Phase 1 tests — explicit names for coverage audit
  it("interceptor_refreshes_access_token_on_401_and_retries_request", async () => {
    localStorage.setItem("refreshToken", "my-refresh-token");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, { user_id: 1 });
    postSpy.mockResolvedValueOnce({ data: { access: "new-access-token" } });

    const response = await apiClient.get("/test");

    expect(postSpy).toHaveBeenCalledOnce();
    expect(postSpy).toHaveBeenCalledWith(expect.stringContaining(API.TOKEN_REFRESH), {
      refresh: "my-refresh-token",
    });
    expect(localStorage.getItem("accessToken")).toBe("new-access-token");
    expect(response.data).toEqual({ userId: 1 });
  });

  it("interceptor_triggers_logout_when_refresh_fails", async () => {
    localStorage.setItem("refreshToken", "bad-refresh");
    mock.onGet("/test").reply(401);
    postSpy.mockRejectedValueOnce(new Error("Refresh failed"));

    await expect(apiClient.get("/test")).rejects.toBeDefined();

    expect(triggerLogoutSpy).toHaveBeenCalledOnce();
  });

  it("interceptor_does_not_send_multiple_refresh_requests_for_concurrent_401s", async () => {
    localStorage.setItem("refreshToken", "my-refresh");
    mock.onGet("/res1").replyOnce(401);
    mock.onGet("/res1").reply(200, { id: 1 });
    mock.onGet("/res2").replyOnce(401);
    mock.onGet("/res2").reply(200, { id: 2 });

    let refreshCallCount = 0;
    postSpy.mockImplementation(async () => {
      refreshCallCount++;
      // Delay forces both concurrent requests to reach the mutex before resolution
      await new Promise<void>((r) => setTimeout(r, 10));
      return { data: { access: "shared-token" } };
    });

    const [r1, r2] = await Promise.all([apiClient.get("/res1"), apiClient.get("/res2")]);

    expect(refreshCallCount).toBe(1);
    expect(r1.data).toEqual({ id: 1 });
    expect(r2.data).toEqual({ id: 2 });
  });

  it("interceptor_does_not_retry_refresh_endpoint_on_401", async () => {
    localStorage.setItem("refreshToken", "my-refresh");
    mock.onGet("/test").reply(401);
    postSpy.mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(apiClient.get("/test")).rejects.toBeDefined();

    expect(triggerLogoutSpy).toHaveBeenCalledOnce();
    // Refresh called only once — no retry loop
    expect(postSpy).toHaveBeenCalledOnce();
  });

  it("rejects non-401 errors without attempting refresh", async () => {
    mock.onGet("/test").reply(404);
    await expect(apiClient.get("/test")).rejects.toMatchObject({
      response: { status: 404 },
    });
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("rejects 401 without refreshToken and does not refresh", async () => {
    mock.onGet("/test").reply(401);
    await expect(apiClient.get("/test")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("attempts token refresh on 401 when refreshToken exists", async () => {
    localStorage.setItem("refreshToken", "my-refresh-token");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, { user_id: 1 });
    postSpy.mockResolvedValueOnce({ data: { access: "new-access-token" } });

    const response = await apiClient.get("/test");

    expect(postSpy).toHaveBeenCalledOnce();
    expect(postSpy).toHaveBeenCalledWith(expect.stringContaining(API.TOKEN_REFRESH), {
      refresh: "my-refresh-token",
    });
    expect(response.data).toEqual({ userId: 1 });
  });

  it("stores new accessToken in localStorage after successful refresh", async () => {
    localStorage.setItem("refreshToken", "my-refresh-token");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, {});
    postSpy.mockResolvedValueOnce({ data: { access: "new-access-token" } });

    await apiClient.get("/test");

    expect(localStorage.getItem("accessToken")).toBe("new-access-token");
  });

  it("uses exact key name 'accessToken' when storing new token", async () => {
    localStorage.setItem("refreshToken", "my-refresh");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, {});
    postSpy.mockResolvedValueOnce({ data: { access: "stored-token" } });

    await apiClient.get("/test");

    expect(localStorage.getItem("accessToken")).toBe("stored-token");
    expect(localStorage.getItem("ACCESS_TOKEN")).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("sends exact refreshToken key to TOKEN_REFRESH endpoint", async () => {
    localStorage.setItem("refreshToken", "real-refresh-value");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, {});
    postSpy.mockResolvedValueOnce({ data: { access: "token" } });

    await apiClient.get("/test");

    expect(postSpy).toHaveBeenCalledWith(expect.stringContaining(API.TOKEN_REFRESH), {
      refresh: "real-refresh-value",
    });
  });

  it("rotates refreshToken when response includes a new refresh field", async () => {
    localStorage.setItem("refreshToken", "old-refresh");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, {});
    postSpy.mockResolvedValueOnce({
      data: { access: "new-access", refresh: "new-refresh" },
    });

    await apiClient.get("/test");

    expect(localStorage.getItem("refreshToken")).toBe("new-refresh");
  });

  it("does NOT rotate refreshToken when response omits refresh field", async () => {
    localStorage.setItem("refreshToken", "original-refresh");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, {});
    postSpy.mockResolvedValueOnce({ data: { access: "new-access" } });

    await apiClient.get("/test");

    expect(localStorage.getItem("refreshToken")).toBe("original-refresh");
  });

  it("retries original request with new token in Authorization header", async () => {
    localStorage.setItem("refreshToken", "my-refresh");
    mock.onGet("/test").replyOnce(401);
    mock.onGet("/test").reply(200, {});
    postSpy.mockResolvedValueOnce({ data: { access: "fresh-token" } });

    await apiClient.get("/test");

    expect(mock.history.get[1].headers?.Authorization).toBe("Bearer fresh-token");
  });

  it("non-401 error with refreshToken present does NOT trigger token refresh", async () => {
    // Key test: if condition is mutated to `true`, this test catches it
    localStorage.setItem("refreshToken", "my-refresh");
    mock.onGet("/test").reply(500);

    await expect(apiClient.get("/test")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("network error without response object does not crash and preserves error type", async () => {
    // Tests the optional chaining `error.response?.status`:
    // without `?`, accessing .status on undefined throws TypeError
    localStorage.setItem("refreshToken", "my-refresh");
    mock.onGet("/test").networkError();

    const err = await apiClient.get("/test").catch((e: unknown) => e);
    expect(err).toBeDefined();
    expect(err).not.toBeInstanceOf(TypeError); // mutation to `.status` would throw TypeError
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("calls triggerLogout when token refresh fails", async () => {
    localStorage.setItem("refreshToken", "bad-refresh");
    mock.onGet("/test").reply(401);
    postSpy.mockRejectedValueOnce(new Error("Refresh failed"));

    await expect(apiClient.get("/test")).rejects.toBeDefined();

    expect(triggerLogoutSpy).toHaveBeenCalledOnce();
  });

  it("concurrent 401s share one refresh call (mutex)", async () => {
    localStorage.setItem("refreshToken", "my-refresh");
    mock.onGet("/res1").replyOnce(401);
    mock.onGet("/res1").reply(200, { id: 1 });
    mock.onGet("/res2").replyOnce(401);
    mock.onGet("/res2").reply(200, { id: 2 });

    let refreshCallCount = 0;
    postSpy.mockImplementation(async () => {
      refreshCallCount++;
      await new Promise<void>((r) => setTimeout(r, 10));
      return { data: { access: "shared-token" } };
    });

    const [r1, r2] = await Promise.all([apiClient.get("/res1"), apiClient.get("/res2")]);

    expect(refreshCallCount).toBe(1);
    expect(r1.data).toEqual({ id: 1 });
    expect(r2.data).toEqual({ id: 2 });
  });
});
