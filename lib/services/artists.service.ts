import { apiClient } from "@/lib/api-client"
import { mergeArtistTagFields } from "@/lib/services/artist-tags"
import type {
  ArtistFilters,
  ArtistListResponse,
  ArtistResponse,
  UpdateArtistAvailabilityRequest,
  UpdateArtistProfileRequest,
  UpdateLocationRequest,
  LocationResponse,
} from "@/lib/types"

const normalizeArtistFilterParams = (filters?: ArtistFilters): Record<string, unknown> | undefined => {
  if (!filters) return undefined

  const mergedTags = mergeArtistTagFields(filters)

  return {
    ...filters,
    ...(mergedTags.length > 0 ? { tags: mergedTags.join(",") } : {}),
  }
}

const normalizeArtistPayload = (payload: UpdateArtistProfileRequest): UpdateArtistProfileRequest => {
  const mergedTags = mergeArtistTagFields(payload)

  const normalized: UpdateArtistProfileRequest = {
    ...payload,
    // Map bio to about_me for backend compatibility
    about_me: payload.bio || payload.about_me,
    bio: undefined,
  }

  if (mergedTags.length > 0) {
    normalized.tags = mergedTags
    normalized.genres = mergedTags
    normalized.event_types = mergedTags
  }

  return normalized
}

const normalizeArtistResponse = (artist: ArtistResponse): ArtistResponse => {
  const mergedTags = mergeArtistTagFields(artist)

  const normalized: ArtistResponse = {
    ...artist,
    // Map about_me from backend to bio for frontend
    bio: (artist as any).about_me || artist.bio,
  }

  if (mergedTags.length > 0) {
    normalized.tags = mergedTags
    normalized.genres = mergedTags
    normalized.event_types = mergedTags
  }

  return normalized
}

export const artistsService = {
  async getAll(filters?: ArtistFilters): Promise<ArtistListResponse> {
    const normalizedFilters = normalizeArtistFilterParams(filters)

    const response = await apiClient.get<ArtistListResponse | ArtistResponse[]>(
      "/artists",
      normalizedFilters
    )

    if (Array.isArray(response)) {
      return {
        items: response.map(normalizeArtistResponse),
        total: response.length,
        limit: filters?.limit ?? response.length,
        offset: filters?.offset ?? 0,
      }
    }

    return {
      ...response,
      items: response.items.map(normalizeArtistResponse),
    }
  },

  async getById(id: string): Promise<ArtistResponse> {
    const artist = await apiClient.get<ArtistResponse>(`/artists/${id}`)
    return normalizeArtistResponse(artist)
  },

  async updateProfile(id: string, payload: UpdateArtistProfileRequest): Promise<ArtistResponse> {
    return apiClient.patch<ArtistResponse>(`/artists/${id}`, normalizeArtistPayload(payload))
  },

  async updateAvailability(id: string, payload: UpdateArtistAvailabilityRequest): Promise<void> {
    return apiClient.patch(`/artists/${id}/availability`, payload)
  },

  async updateLocation(id: string, payload: UpdateLocationRequest): Promise<LocationResponse> {
    return apiClient.post<LocationResponse>(`/artists/${id}/location`, payload)
  },
}
