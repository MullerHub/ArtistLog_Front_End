import { apiClient } from "@/lib/api-client";
import type { Review, Venue } from "@/types/venue";

interface VenueListResponse {
  items: Venue[];
  total: number;
  limit: number;
  offset: number;
}

function normalizeGeoPoint(point: any): { latitude: number; longitude: number } | null {
  if (!point) return null;
  const latitude = point.Latitude ?? point.latitude;
  const longitude = point.Longitude ?? point.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;
  return { latitude, longitude };
}

function normalizeVenue(raw: any): Venue {
  const baseLocation = normalizeGeoPoint(raw.base_location || raw.location);
  const exactLocation = normalizeGeoPoint(raw.exact_location);
  const lat = exactLocation?.latitude ?? baseLocation?.latitude;
  const lng = exactLocation?.longitude ?? baseLocation?.longitude;

  return {
    id: raw.user_id || raw.id,
    venue_name: raw.venue_name || "Contratante",
    email: raw.email || "",
    description: raw.description,
    infrastructure: raw.infrastructure,
    capacity: raw.capacity || 0,
    city: raw.city || "",
    state: raw.state || "",
    address: raw.address,
    lat,
    lng,
    phone: raw.phone,
    whatsapp: raw.whatsapp,
    website: raw.website,
    photo_urls: raw.venue_photos || raw.photo_urls || [],
    profile_photo: raw.profile_photo,
    rating: raw.rating || raw.average_rating || 0,
    review_count: raw.reviews_count || raw.review_count || raw.total_reviews || 0,
    is_community: raw.is_community ?? (raw.origin === "COMMUNITY"),
    is_claimed: !!raw.claimed_by_user_id,
    owner_id: raw.created_by_user_id,
    created_at: raw.created_at || new Date().toISOString(),
  };
}

function normalizeVenueReview(raw: any, venueName?: string): Review {
  return {
    id: raw.id,
    author_id: raw.author_id,
    author_name: raw.author_name || "Usuario",
    author_role: "ARTIST",
    target_id: raw.venue_id,
    target_name: venueName || "Contratante",
    target_type: "venue",
    rating: raw.rating || 0,
    comment: raw.comment || "",
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export const venuesService = {
  async list(filters?: {
    q?: string;
    city?: string;
    state?: string;
    min_capacity?: number;
    max_capacity?: number;
    limit?: number;
    offset?: number;
  }): Promise<VenueListResponse> {
    const response = await apiClient.get<VenueListResponse | any[]>("/venues", filters as Record<string, unknown>);

    if (Array.isArray(response)) {
      const items = response.map(normalizeVenue);
      return {
        items,
        total: items.length,
        limit: filters?.limit || items.length,
        offset: filters?.offset || 0,
      };
    }

    return {
      ...response,
      items: (response.items || []).map(normalizeVenue),
    };
  },

  async getById(id: string): Promise<Venue> {
    const venue = await apiClient.get<any>(`/venues/${id}`);
    return normalizeVenue(venue);
  },

  async getNearby(params: { latitude: number; longitude: number; radius: number }): Promise<Venue[]> {
    const venues = await apiClient.get<any[]>("/venues/nearby", params as Record<string, unknown>);
    return (venues || []).map(normalizeVenue);
  },

  async getReviews(venueId: string): Promise<Review[]> {
    const venue = await this.getById(venueId);
    const reviews = await apiClient.get<any[]>(`/venues/${venueId}/reviews`);
    return (reviews || []).map((review) => normalizeVenueReview(review, venue.venue_name));
  },

  async createReview(venueId: string, payload: { rating: number; comment: string }): Promise<void> {
    await apiClient.post(`/venues/${venueId}/reviews`, payload);
  },

  async createCommunityVenue(payload: {
    venue_name: string;
    description?: string;
    infrastructure?: string;
    capacity: number;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    is_anonymous: boolean;
  }): Promise<{ id: string; message: string }> {
    return apiClient.post<{ id: string; message: string }>("/venues/community", payload);
  },

  async getCommunityVenues(params?: {
    q?: string;
    city?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }): Promise<Venue[]> {
    const response = await apiClient.get<any[]>("/venues/community", params as Record<string, unknown>);
    return (response || []).map(normalizeVenue);
  },

  async claimCommunityVenue(venueId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/venues/${venueId}/claim`, {});
  },

  async registerView(id: string): Promise<void> {
    await apiClient.postPublicSilent(`/venues/${id}/view`, {});
  },
};
