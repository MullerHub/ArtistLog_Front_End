import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientGet = vi.fn();
const apiClientPostPublicSilent = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: apiClientGet,
    postPublicSilent: apiClientPostPublicSilent,
  },
}));

describe("artistsService", () => {
  beforeEach(() => {
    apiClientGet.mockReset();
    apiClientPostPublicSilent.mockReset();
  });

  it("normalizes list payload when backend returns array", async () => {
    apiClientGet.mockResolvedValueOnce([
      {
        user_id: "a1",
        stage_name: "DJ Test",
        about_me: "Bio",
        genres: ["House"],
        city: "Sao Paulo",
        state: "SP",
      },
    ]);

    const { artistsService } = await import("@/services/artists-service");
    const response = await artistsService.list();

    expect(response.items).toHaveLength(1);
    expect(response.items[0]).toMatchObject({
      id: "a1",
      stage_name: "DJ Test",
      bio: "Bio",
      genres: ["House"],
    });
  });

  it("registers artist profile view in silent mode", async () => {
    apiClientPostPublicSilent.mockResolvedValueOnce(undefined);

    const { artistsService } = await import("@/services/artists-service");
    await artistsService.registerView("artist-9");

    expect(apiClientPostPublicSilent).toHaveBeenCalledWith("/artists/artist-9/view", {});
  });
});
