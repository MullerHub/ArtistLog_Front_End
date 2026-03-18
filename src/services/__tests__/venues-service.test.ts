import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientGet = vi.fn();
const apiClientPost = vi.fn();
const apiClientPostPublicSilent = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: apiClientGet,
    post: apiClientPost,
    postPublicSilent: apiClientPostPublicSilent,
  },
}));

describe("venuesService", () => {
  beforeEach(() => {
    apiClientGet.mockReset();
    apiClientPost.mockReset();
    apiClientPostPublicSilent.mockReset();
  });

  it("normalizes coordinates from backend location aliases", async () => {
    apiClientGet.mockResolvedValueOnce([
      {
        user_id: "v1",
        venue_name: "Casa Central",
        city: "Sao Paulo",
        state: "SP",
        capacity: 200,
        location: { Latitude: -23.55, Longitude: -46.63 },
      },
    ]);

    const { venuesService } = await import("@/services/venues-service");
    const response = await venuesService.list();

    expect(response.items[0]).toMatchObject({
      id: "v1",
      venue_name: "Casa Central",
      lat: -23.55,
      lng: -46.63,
    });
  });

  it("creates review using venue review endpoint", async () => {
    apiClientPost.mockResolvedValueOnce(undefined);

    const { venuesService } = await import("@/services/venues-service");
    await venuesService.createReview("v1", { rating: 5, comment: "Excelente" });

    expect(apiClientPost).toHaveBeenCalledWith("/venues/v1/reviews", { rating: 5, comment: "Excelente" });
  });
});
