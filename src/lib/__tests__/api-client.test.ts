import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("apiClient", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    localStorage.clear();
    localStorage.setItem("artistlog_token", "token-123");
  });

  it("sends auth header and query params on GET", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const { apiClient } = await import("@/lib/api-client");

    const result = await apiClient.get<{ ok: boolean }>("/artists", {
      q: "rock",
      limit: 10,
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/artists?q=rock&limit=10");
    expect((options.headers as Record<string, string>).Authorization).toBe("Bearer token-123");
  });

  it("throws ApiError with status and data on non-2xx", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "invalid" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );

    const { apiClient } = await import("@/lib/api-client");

    await expect(apiClient.get("/artists")).rejects.toMatchObject({
      status: 400,
      message: "invalid",
    });
  });
});
