import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientGet = vi.fn();
const apiClientPatch = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: apiClientGet,
    patch: apiClientPatch,
  },
}));

describe("locationService", () => {
  beforeEach(() => {
    apiClientGet.mockReset();
    apiClientPatch.mockReset();
  });

  it("searches cities from backend endpoint", async () => {
    apiClientGet.mockResolvedValueOnce({
      cities: [{ name: "Sao Paulo", state: "SP", latitude: -23.55, longitude: -46.63 }],
    });

    const { locationService } = await import("@/services/location-service");
    const response = await locationService.searchCities("sao");

    expect(apiClientGet).toHaveBeenCalledWith("/cities/search", { q: "sao" });
    expect(response.cities[0].state).toBe("SP");
  });

  it("updates current user location", async () => {
    apiClientPatch.mockResolvedValueOnce({
      latitude: -23.5,
      longitude: -46.6,
      updated_at: "2026-03-14T00:00:00Z",
    });

    const { locationService } = await import("@/services/location-service");
    await locationService.updateMyLocation({ latitude: -23.5, longitude: -46.6 });

    expect(apiClientPatch).toHaveBeenCalledWith("/me/location", {
      latitude: -23.5,
      longitude: -46.6,
    });
  });
});
