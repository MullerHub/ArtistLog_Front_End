/** Core user account */
export interface User {
  id: string;
  email: string;
  role: 'ARTIST' | 'VENUE';
  created_at: string;
}

/** Geographic coordinate pair */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Artist public/private profile */
export interface ArtistProfile {
  id: string;
  user_id: string;
  stage_name: string;
  bio: string;
  /** Base performance fee in USD */
  cache_base: number;
  tags: string[];
  location: LatLng;
  city: string;
  state: string;
  photo_url: string;
}

/** Venue public/private profile */
export interface VenueProfile {
  id: string;
  user_id: string;
  venue_name: string;
  bio: string;
  capacity: number;
  infrastructure: string[];
  city: string;
  state: string;
  location: LatLng;
  photo_url: string;
}

/** Community-submitted venue (may be anonymous or claimed) */
export interface CommunityVenue {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  description: string;
  status: 'ACTIVE' | 'CLAIMED';
  created_by_user_id?: string;
  is_anonymous: boolean;
  created_at: string;
}

/** Booking contract between artist and venue */
export interface Contract {
  id: string;
  artist_id: string;
  venue_id: string;
  /** ISO 8601 date string (e.g. "2025-08-15") */
  date: string;
  /** Time string (e.g. "21:00") */
  time: string;
  /** Contract value in USD */
  value: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  details?: string;
  tags: string[];
  /** Denormalised for display purposes */
  artist_name?: string;
  venue_name?: string;
  created_at: string;
}

/** An artist's availability slot */
export interface ScheduleSlot {
  id: string;
  artist_id: string;
  /** ISO 8601 date string */
  date: string;
  available: boolean;
  notes?: string;
}

/** Post-performance review left by either party */
export interface Review {
  id: string;
  artist_id: string;
  venue_id: string;
  /** Integer 1–5 */
  rating: number;
  comment: string;
  created_at: string;
}

export type NotificationType =
  | 'CONTRACT_PROPOSAL'
  | 'CONTRACT_STATUS_CHANGE'
  | 'REVIEW_RECEIVED'
  | 'COMMUNITY_VENUE_CLAIMED'
  | 'WELCOME';

/** In-app notification */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

/** Per-type notification delivery preferences for a user */
export interface NotificationPreferences {
  user_id: string;
  type: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
}

/** Successful authentication response */
export interface AuthResponse {
  token: string;
  user: User;
}

/** Standard API error shape */
export interface ApiError {
  message: string;
  status: number;
}

/** City search result */
export interface City {
  name: string;
  state: string;
  country: string;
}
