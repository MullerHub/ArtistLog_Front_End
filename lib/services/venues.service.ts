import { apiClient } from "@/lib/api-client"
import type {
  VenueFilters,
  VenueListResponse,
  VenueResponse,
  NearbyVenueResponse,
  UpdateVenueProfileRequest,
  ReviewResponse,
  CreateReviewRequest,
} from "@/lib/types"

export const venuesService = {
  async getAll(filters?: VenueFilters): Promise<VenueListResponse> {
    const response = await apiClient.get<VenueListResponse | VenueResponse[]>(
      "/venues",
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

  async getById(id: string): Promise<VenueResponse> {
    return apiClient.get<VenueResponse>(`/venues/${id}`)
  },

  async updateProfile(id: string, payload: UpdateVenueProfileRequest): Promise<VenueResponse> {
    return apiClient.patch<VenueResponse>(`/venues/${id}`, payload)
  },

  async getNearby(params: {
    latitude: number
    longitude: number
    radius: number
  }): Promise<NearbyVenueResponse[]> {
    return apiClient.get<NearbyVenueResponse[]>("/venues/nearby", params as Record<string, unknown>)
  },

  async getAvailableArtists(
    venueId: string,
    params: {
      day: number
      start_time: string
      end_time: string
      min_duration?: number
    }
  ): Promise<unknown[]> {
    return apiClient.get<unknown[]>(
      `/venues/${venueId}/available-artists`,
      params as Record<string, unknown>
    )
  },

  async getReviews(
    venueId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<ReviewResponse[]> {
    return apiClient.get<ReviewResponse[]>(
      `/venues/${venueId}/reviews`,
      params as Record<string, unknown>
    )
  },

  async createReview(venueId: string, payload: CreateReviewRequest): Promise<unknown> {
    return apiClient.post(`/venues/${venueId}/reviews`, payload)
  },

  // ===== COMMUNITY VENUES (Phase 3) =====
  async createCommunityVenue(payload: {
    venue_name: string
    description?: string
    capacity: number
    city: string
    state: string
    is_anonymous: boolean
    latitude: number
    longitude: number
    infrastructure?: string
    phone?: string
    website?: string
  }): Promise<{ id: string; message: string }> {
    return apiClient.post("/venues/community", payload)
  },

  async getCommunityVenues(params?: {
    q?: string
    city?: string
    state?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<Array<{
    id: string
    venue_name: string
    description: string
    infrastructure: string
    capacity: number
    city: string
    state: string
    status: string
    is_anonymous: boolean
    created_at: string
    updated_at: string
  }>> {
    return apiClient.get("/venues/community", params as Record<string, unknown>)
  },

  async getClaimCandidates(params: {
    venue_name: string
    lat: number
    lon: number
    distance?: number
  }): Promise<Array<{
    id: string
    venue_name: string
    description: string | null
    capacity: number
    city: string
    state: string
    distance_km: number
    is_anonymous: boolean
    created_by_user_id: string | null
    created_at: string
  }>> {
    return apiClient.get("/venues/claim-candidates", params as Record<string, unknown>)
  },

  async claimCommunityVenue(venueId: string): Promise<{ message: string }> {
    return apiClient.post(`/venues/${venueId}/claim`, {})
  },
}
