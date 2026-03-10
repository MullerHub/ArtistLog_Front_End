import { apiClient } from "@/lib/api-client"
import type {
  VenueFilters,
  VenueListResponse,
  VenueResponse,
  NearbyVenueResponse,
  UpdateVenueProfileRequest,
  UpdateVenueExactLocationRequest,
  UpdateVenueExactLocationResponse,
  ReviewResponse,
  CreateReviewRequest,
  GeoPoint,
} from "@/lib/types"

const normalizeGeoPoint = (point: any): GeoPoint | undefined => {
  if (!point) return undefined
  return {
    latitude: point.Latitude ?? point.latitude,
    longitude: point.Longitude ?? point.longitude,
  }
}

const normalizeVenueResponse = (venue: VenueResponse): VenueResponse => {
  // Backend sends both "location" and "base_location" (as aliases) with Latitude/Longitude (capital L)
  // Priority: base_location > location
  const rawBaseLocation = (venue as any).base_location || (venue as any).location
  const baseLocation = normalizeGeoPoint(rawBaseLocation)

  // Backend sends exact_location with Latitude/Longitude (capital L)
  const exactLocation = normalizeGeoPoint((venue as any).exact_location || (venue as any).exactLocation)

  return {
    ...venue,
    // Map user_id from backend to id
    id: (venue as any).user_id || venue.id,
    base_location: baseLocation,
    exact_location: exactLocation,
  }
}

const normalizeNearbyVenueResponse = (venue: NearbyVenueResponse): NearbyVenueResponse => {
  // Backend now sends base_location, but we keep location for backwards compatibility
  const rawBaseLocation = (venue as any).base_location || (venue as any).location
  const baseLocation = normalizeGeoPoint(rawBaseLocation) ?? null
  
  return {
    ...venue,
    base_location: baseLocation,
    location: baseLocation, // Keep for backwards compatibility with existing code
    exact_location: normalizeGeoPoint(venue.exact_location) ?? null,
  }
}

export const venuesService = {
  async getAll(filters?: VenueFilters): Promise<VenueListResponse> {
    const response = await apiClient.get<VenueListResponse | VenueResponse[]>(
      "/venues",
      filters as Record<string, unknown>
    )

    if (Array.isArray(response)) {
      return {
        items: response.map(normalizeVenueResponse),
        total: response.length,
        limit: filters?.limit ?? response.length,
        offset: filters?.offset ?? 0,
      }
    }

    return {
      ...response,
      items: response.items.map(normalizeVenueResponse),
    }
  },

  async getById(id: string): Promise<VenueResponse> {
    const venue = await apiClient.get<VenueResponse>(`/venues/${id}`)
    console.log('🔍 [venuesService.getById] Raw response from backend:', JSON.stringify(venue, null, 2))
    console.log('🔍 [venuesService.getById] Raw location field:', (venue as any).location)
    console.log('🔍 [venuesService.getById] Raw exact_location field:', (venue as any).exact_location)
    console.log('🔍 [venuesService.getById] city:', venue.city, 'state:', venue.state)
    const normalized = normalizeVenueResponse(venue)
    console.log('🔍 [venuesService.getById] After normalization:')
    console.log('  - base_location:', normalized.base_location)
    console.log('  - exact_location:', normalized.exact_location)
    return normalized
  },

  async updateProfile(id: string, payload: UpdateVenueProfileRequest): Promise<VenueResponse> {
    const response = await apiClient.patch<VenueResponse>(`/venues/${id}`, payload)
    return normalizeVenueResponse(response)
  },

  async updateExactLocation(
    id: string,
    payload: UpdateVenueExactLocationRequest
  ): Promise<UpdateVenueExactLocationResponse> {
    const response = await apiClient.patch<any>(`/venues/${id}/location`, payload)
    
    // Normalize the updated_at field from Go's time structure
    let normalizedUpdatedAt: string | null = null
    if (response.updated_at) {
      if (typeof response.updated_at === 'object' && 'Time' in response.updated_at) {
        // Go's time.Time structure with Valid field
        normalizedUpdatedAt = response.updated_at.Valid && response.updated_at.Time !== '0001-01-01T00:00:00Z' 
          ? response.updated_at.Time 
          : null
      } else if (typeof response.updated_at === 'string') {
        normalizedUpdatedAt = response.updated_at !== '0001-01-01T00:00:00Z' ? response.updated_at : null
      }
    }

    const normalized: UpdateVenueExactLocationResponse = {
      status: response.status,
      message: response.message,
      exact_latitude: response.exact_latitude,
      exact_longitude: response.exact_longitude,
      updated_at: normalizedUpdatedAt,
    }

    console.log('✅ [updateExactLocation] Success:', {
      coordinates: { lat: normalized.exact_latitude, lng: normalized.exact_longitude },
      updated_at: normalized.updated_at,
    })

    return normalized
  },

  async getNearby(params: {
    latitude: number
    longitude: number
    radius: number
  }): Promise<NearbyVenueResponse[]> {
    const venues = await apiClient.get<NearbyVenueResponse[]>("/venues/nearby", params as Record<string, unknown>)
    return venues.map(normalizeNearbyVenueResponse)
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
    exact_location?: {
      latitude: number
      longitude: number
    } | null
    is_anonymous: boolean
    created_by_user_id?: string
    created_at: string
    updated_at: string
  }>> {
    const venues = await apiClient.get("/venues/community", params as Record<string, unknown>)
    // Normalize exact_location if present
    if (Array.isArray(venues)) {
      return venues.map((venue: any) => ({
        ...venue,
        status: venue.status || "ACTIVE",
        exact_location: normalizeGeoPoint(venue.exact_location) ?? null,
      }))
    }
    return venues as any
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

  async registerView(id: string): Promise<void> {
    try {
      await apiClient.postPublicSilent(`/venues/${id}/view`, {})
    } catch (err: unknown) {
      // Falha silenciosa - não é crítico
    }
  },
}
