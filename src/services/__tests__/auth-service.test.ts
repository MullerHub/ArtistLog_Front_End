import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientCallable = vi.fn();
const apiClientGet = vi.fn();

vi.mock("@/lib/api-client", () => {
  const apiClient = Object.assign(apiClientCallable, {
    get: apiClientGet,
  });
  return { apiClient };
});

describe("authService", () => {
  beforeEach(() => {
    apiClientCallable.mockReset();
    apiClientGet.mockReset();
    localStorage.clear();
  });

  it("stores token and user on login", async () => {
    const payload = {
      access_token: "jwt-token",
      user: { id: "u1", email: "test@artistlog.com", role: "ARTIST" },
    };

    apiClientCallable.mockResolvedValueOnce(payload);

    const { authService } = await import("@/services/auth-service");
    const response = await authService.login({ email: "test@artistlog.com", password: "123456" });

    expect(response).toEqual(payload);
    expect(localStorage.getItem("artistlog_token")).toBe("jwt-token");
    expect(localStorage.getItem("artistlog_user")).toContain("test@artistlog.com");
  });

  it("reads authenticated user via /auth/me", async () => {
    apiClientCallable.mockResolvedValueOnce({ id: "u1", email: "a@b.com", role: "VENUE" });

    const { authService } = await import("@/services/auth-service");
    const me = await authService.getMe();

    expect(me.email).toBe("a@b.com");
    expect(apiClientCallable).toHaveBeenCalledWith("/auth/me", { method: "GET" });
  });
});
