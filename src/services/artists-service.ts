import { apiClient } from "@/lib/api-client";
import type { Artist } from "@/types/artist";

interface ArtistListResponse {
  items: Artist[];
  total: number;
  limit: number;
  offset: number;
}

function normalizeArtist(raw: any): Artist {
  const tags = raw.tags || raw.genres || raw.event_types || [];

  return {
    id: raw.user_id || raw.id,
    stage_name: raw.stage_name || "Artista",
    email: raw.email || "",
    bio: raw.about_me || raw.bio || "",
    about_me: raw.about_me || raw.bio || "",
    tags,
    genres: raw.genres || tags,
    event_types: raw.event_types || tags,
    phone: raw.phone,
    whatsapp: raw.whatsapp,
    website: raw.website,
    soundcloud_links: raw.soundcloud_links || [],
    photo_urls: raw.photo_urls || [],
    profile_photo: raw.profile_photo,
    cache_base: raw.cache_base || 0,
    city: raw.city || "",
    state: raw.state || "",
    rating: raw.rating || 0,
    review_count: raw.review_count || 0,
    is_available: !!raw.is_available,
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export const artistsService = {
  async list(filters?: {
    q?: string;
    available?: boolean;
    tags?: string;
    city?: string;
    state?: string;
    min_cache?: number;
    max_cache?: number;
    limit?: number;
    offset?: number;
  }): Promise<ArtistListResponse> {
    const response = await apiClient.get<ArtistListResponse | any[]>("/artists", filters as Record<string, unknown>);

    if (Array.isArray(response)) {
      const items = response.map(normalizeArtist);
      return {
        items,
        total: items.length,
        limit: filters?.limit || items.length,
        offset: filters?.offset || 0,
      };
    }

    return {
      ...response,
      items: (response.items || []).map(normalizeArtist),
    };
  },

  async getById(id: string): Promise<Artist> {
    const artist = await apiClient.get<any>(`/artists/${id}`);
    return normalizeArtist(artist);
  },

  async registerView(id: string): Promise<void> {
    await apiClient.postPublicSilent(`/artists/${id}/view`, {});
  },
};
