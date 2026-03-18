import { apiClient } from "@/lib/api-client";
import type { LocationResponse, SearchCitiesResponse, UpdateLocationRequest } from "@/types/location";

export const locationService = {
  async searchCities(q: string): Promise<SearchCitiesResponse> {
    return apiClient.get<SearchCitiesResponse>("/cities/search", { q });
  },

  async updateMyLocation(payload: UpdateLocationRequest): Promise<LocationResponse> {
    return apiClient.patch<LocationResponse>("/me/location", payload);
  },
};
