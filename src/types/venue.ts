export interface Venue {
  id: string;
  venue_name: string;
  email: string;
  description?: string;
  infrastructure?: string;
  capacity: number;
  city: string;
  state: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  whatsapp?: string;
  website?: string;
  photo_urls: string[];
  profile_photo?: string;
  rating: number;
  review_count: number;
  is_community: boolean;
  is_claimed: boolean;
  owner_id?: string;
  created_at: string;
  // Preferences
  email_notifications?: boolean;
  push_notifications?: boolean;
  auto_accept?: boolean;
  is_public?: boolean;
}

export interface Review {
  id: string;
  author_id: string;
  author_name: string;
  author_role: "ARTIST" | "VENUE";
  target_id: string;
  target_name: string;
  target_type: "artist" | "venue";
  rating: number;
  comment: string;
  created_at: string;
}

export interface VenueFilters {
  search: string;
  state: string;
  city: string;
  min_capacity: number;
  max_capacity: number;
}
