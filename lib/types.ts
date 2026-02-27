/**
 * ============================================================================
 * ArtistLog API Type Definitions
 * Extracted from Swagger 2.0 specification
 * ============================================================================
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpArtistRequest {
  stage_name: string
  email: string
  password: string
  bio?: string
  cache_base: number
  city: string
  state: string
}

export interface SignUpVenueRequest {
  venue_name: string
  email: string
  password: string
  capacity: number
  infrastructure: string
  city: string
  state: string
}

export interface AuthResponse {
  access_token: string
  expires_in: number
  user: UserResponse
}

export interface UserResponse {
  id: string
  email: string
  role: "ARTIST" | "VENUE"
  created_at: string
  updated_at: string
}

// ============================================================================
// ARTIST TYPES
// ============================================================================

export interface ArtistResponse {
  id: string
  stage_name: string
  bio?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  photo_urls?: string[]
  profile_photo?: string
  cache_base?: number
  is_available: boolean
  rating: number
  tags?: string[]
  genres?: string[]
  base_location?: GeoPoint
  current_location?: GeoPoint
  city?: string
  state?: string
  created_at: string
  updated_at: string
}

export interface ArtistListResponse {
  items: ArtistResponse[]
  total: number
  limit: number
  offset: number
}

export interface UpdateArtistProfileRequest {
  stage_name?: string
  bio?: string
  cache_base?: number
  is_available?: boolean
  tags?: string[]
  genres?: string[]
  photo_urls?: string[]
  profile_photo?: string
  website?: string
  soundcloud_links?: string[]
}

export interface UpdateArtistAvailabilityRequest {
  is_available: boolean
}

// ============================================================================
// VENUE TYPES
// ============================================================================

export interface VenueResponse {
  id: string
  venue_name: string
  capacity: number
  infrastructure: string
  rating: number
  reviews_count: number
  base_location?: GeoPoint
  venue_photos?: string[]
  profile_photo?: string
  description?: string
  phone?: string
  website?: string
  origin?: string // "OWNER" or "COMMUNITY"
  is_community?: boolean // true if venue is community-created
  is_anonymous?: boolean
  created_by_user_id?: string
  created_at: string
  updated_at: string
}

export interface VenueListResponse {
  items: VenueResponse[]
  total: number
  limit: number
  offset: number
}

export interface NearbyVenueResponse {
  venue_id: string
  origin: string // "OWNER" ou "COMMUNITY"
  status: string
  venue_name: string
  city: string
  state: string
  description?: string | null
  infrastructure?: string | null
  venue_photos?: string[]
  profile_photo?: string | null
  capacity: number
  location: GeoPoint | null
  hours?: string | null
  phone?: string | null
  website?: string | null
  average_rating?: number | null
  total_reviews?: number | null
  created_by_user_id?: string | null
  claimed_by_user_id?: string | null
  is_anonymous: boolean
  claimed_at?: string | null
  distance_meters?: number
  created_at: string
  updated_at: string
}

export interface UpdateVenueProfileRequest {
  venue_name?: string
  capacity?: number
  description?: string
  infrastructure?: string
  hours?: string
  phone?: string
  website?: string
  venue_photos?: string[]
  profile_photo?: string
  base_location?: GeoPoint
}

// ============================================================================
// SCHEDULE TYPES
// ============================================================================

export interface ScheduleResponse {
  id: string
  artist_id: string
  min_gig_duration: number
  notes?: string
  is_active: boolean
  preferred_event_types?: string[]
  slots: SlotResponse[]
  created_at: string
  updated_at: string
}

export interface SlotResponse {
  id: string
  schedule_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_booked: boolean
  crosses_midnight?: boolean
}

export interface CreateScheduleRequest {
  min_gig_duration: number
  preferred_event_types?: string[]
  notes?: string
}

export interface AddScheduleSlotRequest {
  day_of_week: number
  start_time: string
  end_time: string
  crosses_midnight?: boolean // true se o evento passa de meia-noite
}

export interface UpdateScheduleRequest {
  min_gig_duration?: number
  preferred_event_types?: string[]
  notes?: string
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ReviewResponse {
  id: string
  venue_id: string
  author_id: string
  author_name: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface CreateReviewRequest {
  rating: number
  comment: string
}

// ============================================================================
// LOCATION TYPES
// ============================================================================

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface LocationResponse {
  latitude: number
  longitude: number
  updated_at: string
}

export interface UpdateLocationRequest {
  latitude: number
  longitude: number
}

export interface City {
  name: string
  state: string
  latitude: number
  longitude: number
}

export interface SearchCitiesResponse {
  cities: City[]
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadResponse {
  file_url: string
  file_size: number
  mime_type: string
}

// ============================================================================
// CONTRACT TYPES
// ============================================================================

export type ContractStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED"

export interface Contract {
  id: string
  artist_id: string
  venue_id: string
  event_date: string // YYYY-MM-DD
  final_price: number
  status: ContractStatus
  created_at: string
  updated_at: string
}

export interface CreateContractRequest {
  artist_id: string
  venue_id: string
  event_date: string
  final_price: number
}

export interface UpdateContractStatusRequest {
  status: ContractStatus
}

export interface ContractListResponse {
  items: Contract[]
  total: number
  limit: number
  offset: number
}

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

export interface HealthResponse {
  status: "ok" | "error"
  database: "ok" | "error"
  timestamp: string
  uptime: string
  version: string
}

export interface ReadinessResponse {
  ready: boolean
  database: boolean
  message: string
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ErrorResponse {
  error: boolean
  status: number
  message: string
  description?: string
  details?: string
}

// ============================================================================
// PAGINATION & FILTERS
// ============================================================================

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface ArtistFilters extends PaginationParams {
  available?: boolean
  tags?: string
  genres?: string
  event_types?: string
  q?: string
}

export interface VenueFilters extends PaginationParams {
  min_capacity?: number
  max_capacity?: number
  min_rating?: number
  q?: string
  city?: string
  state?: string
  origin?: string // "OWNER", "COMMUNITY", or "ALL"
}

// ============================================================================
// VALIDATION CONSTRAINTS
// ============================================================================

export const ValidationConstraints = {
  PASSWORD: {
    min: 8,
  },
  STAGE_NAME: {
    min: 2,
    max: 150,
  },
  BIO: {
    max: 500,
  },
  VENUE_NAME: {
    min: 2,
    max: 150,
  },
  INFRASTRUCTURE: {
    max: 500,
  },
  NOTES: {
    max: 500,
  },
  MIN_GIG_DURATION: {
    min: 30,
  },
  COMMENT: {
    min: 10,
    max: 500,
  },
  RATING: {
    min: 1,
    max: 5,
  },
  LATITUDE: {
    min: -90,
    max: 90,
  },
  LONGITUDE: {
    min: -180,
    max: 180,
  },
  LIMIT: {
    default: 50,
    max: 500,
  },
  OFFSET: {
    default: 0,
  },
  DAY_OF_WEEK: {
    min: 0,
    max: 6,
  },
} as const

// ============================================================================
// HELPER TYPES
// ============================================================================

export type UserRole = "ARTIST" | "VENUE"

export type EventType =
  | "wedding"
  | "corporate"
  | "festival"
  | "nightclub"
  | "bar"
  | "custom"

export type ListResponse<T> = {
  items: T[]
  total: number
  limit: number
  offset: number
}

export enum DayOfWeek {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}
