import { apiClient } from "@/lib/api-client"
import type {
  ArtistFilters,
  ArtistListResponse,
  ArtistResponse,
  UpdateArtistAvailabilityRequest,
  UpdateArtistProfileRequest,
  UpdateLocationRequest,
  LocationResponse,
} from "@/lib/types"

export const artistsService = {
  async getAll(filters?: ArtistFilters): Promise<ArtistListResponse> {
    const response = await apiClient.get<ArtistListResponse | ArtistResponse[]>(
      "/artists",
      filters as Record<string, unknown>
    )

    if (Array.isArray(response)) {
      return {
        items: response,
        total: response.length,
        limit: filters?.limit ?? response.length,
        offset: filters?.offset ?? 0,
      }
    }

    return response
  },

  async getById(id: string): Promise<ArtistResponse> {
    return apiClient.get<ArtistResponse>(`/artists/${id}`)
  },

  async updateProfile(id: string, payload: UpdateArtistProfileRequest): Promise<ArtistResponse> {
    return apiClient.patch<ArtistResponse>(`/artists/${id}`, payload)
  },

  async updateAvailability(id: string, payload: UpdateArtistAvailabilityRequest): Promise<void> {
    return apiClient.patch(`/artists/${id}/availability`, payload)
  },

  async updateLocation(id: string, payload: UpdateLocationRequest): Promise<LocationResponse> {
    return apiClient.post<LocationResponse>(`/artists/${id}/location`, payload)
  },
}
