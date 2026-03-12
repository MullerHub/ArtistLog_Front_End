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
  about_me?: string
  tags?: string[]
  genres?: string[]
  event_types?: string[]
  phone?: string
  whatsapp?: string
  website?: string
  soundcloud_links?: string[]
  photo_urls?: string[]
  profile_photo?: string
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
  about_me?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  soundcloud_links?: string[]
  photo_urls?: string[]
  profile_photo?: string
  cache_base?: number
  is_available: boolean
  rating: number
  profile_views_count?: number
  tags?: string[]
  genres?: string[]
  event_types?: string[]
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
  about_me?: string
  cache_base?: number
  is_available?: boolean
  tags?: string[]
  genres?: string[]
  event_types?: string[]
  photo_urls?: string[]
  profile_photo?: string
  email?: string
  phone?: string
  whatsapp?: string
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
  profile_views_count?: number
  base_location?: GeoPoint
  exact_location?: GeoPoint
  city?: string
  state?: string
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
  base_location?: GeoPoint | null
  location?: GeoPoint | null // Deprecated: use base_location
  exact_location?: GeoPoint | null
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

export interface UpdateVenueExactLocationRequest {
  exact_latitude?: number
  exact_longitude?: number
}

export interface UpdateVenueExactLocationResponse {
  status: string
  message: string
  exact_latitude?: number
  exact_longitude?: number
  updated_at: string | null | { Time: string; Valid: boolean }
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
  event_time?: string
  duration_hours?: number
  equipment_requirements?: string
  terms?: string
  description?: string
  message?: string
  signature_document_id?: string
  signature_url?: string
  signed_at?: string
  is_deleted: boolean
  deleted_at?: string
  deleted_by?: string
  counter_proposal_price?: number
  counter_proposal_message?: string
  status: ContractStatus
  created_at: string
  updated_at: string
}

export interface CreateContractRequest {
  artist_id: string
  venue_id: string
  event_date: string
  final_price: number
  description?: string
  message?: string
  event_time?: string
  duration_hours?: number
  equipment_requirements?: string
  terms?: string
}

export interface UpdateContractStatusRequest {
  status: ContractStatus
  message?: string
  counter_proposal_price?: number
  counter_proposal_message?: string
}

export interface ContractListResponse {
  items: Contract[]
  total: number
  limit: number
  offset: number
}

// ============================================================================
// CONTRACT TEMPLATE TYPES
// ============================================================================

export interface ContractTemplate {
  id: string
  artist_id: string
  template_name: string
  description?: string
  file_path: string
  file_size_bytes: number
  content_hash: string
  mime_type: string
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
  // Compat fields used by legacy UI flows.
  file_url?: string
  file_name?: string
}

export interface UploadContractTemplateRequest {
  file: File
  template_name: string
  description?: string
}

export interface ContractTemplateListResponse {
  items: ContractTemplate[]
}

export interface TemplateAcceptance {
  id: string
  contract_id: string
  template_id: string
  accepted_by_role: "ARTIST" | "VENUE"
  accepted_at: string
  accepted_by_ip?: string
  acceptance_location?: {
    latitude: number
    longitude: number
  }
  metadata?: string
  created_at: string
}

export interface ContractTemplateDetailResponse {
  template: ContractTemplate
  acceptance?: TemplateAcceptance
}

export interface ContractTemplateDecisionPayload {
  contract_id?: string
  template_id: string
  ip_address?: string
  metadata?: Record<string, unknown>
}

export interface RejectTemplateResponse {
  message: string
}

// ============================================================================
// PROPOSALS TYPES
// ============================================================================

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "SUPERSEDED"

export interface Proposal {
  id: string
  contract_id: string
  proposed_by_user_id: string
  proposed_by_role: "ARTIST" | "VENUE"
  proposed_price?: number
  proposed_date?: string
  proposed_time?: string
  proposed_duration?: number
  message: string
  status: ProposalStatus
  rejection_message?: string
  created_at: string
  updated_at: string
}

export interface ProposalListResponse {
  data: Proposal[]
  total: number
  limit: number
  offset: number
}

// ============================================================================
// MESSAGES TYPES
// ============================================================================

export type MessageType = "USER" | "SYSTEM"

export interface Message {
  id: string
  contract_id: string
  sender_id: string
  sender_role: "ARTIST" | "VENUE"
  message: string
  type: MessageType
  is_system_message: boolean
  read_at?: string
  created_at: string
  updated_at: string
}

export interface MessageListResponse {
  data: Message[]
  total: number
  limit: number
  offset: number
}

export interface UnreadCountResponse {
  contract_id: string
  unread_count: number
  last_unread_at?: string
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditAction =
  | "CREATE"
  | "UPDATE_STATUS"
  | "SEND_PROPOSAL"
  | "ACCEPT_PROPOSAL"
  | "REJECT_PROPOSAL"
  | "SEND_MESSAGE"
  | "SIGNATURE_SENT"
  | "SIGNATURE_COMPLETED"
  | "SIGNATURE_CANCELLED"
  | "SOFT_DELETE"

export interface AuditLog {
  id: string
  contract_id: string
  user_id: string
  user_role: "ARTIST" | "VENUE"
  action: AuditAction
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  created_at: string
}

export interface AuditLogListResponse {
  data: AuditLog[]
  total: number
  limit: number
  offset: number
}

export interface UserAuditResponse {
  user_id: string
  data: AuditLog[]
  total: number
  limit: number
  offset: number
}

// ============================================================================
// SIGNATURE DIGITAL TYPES (legacy/compat)
// ============================================================================

export type SignatureStatusType =
  | "PENDING_SIGNATURE"
  | "PARTIALLY_SIGNED"
  | "FULLY_SIGNED"
  | "SIGNATURE_CANCELLED"
  | "SIGNATURE_EXPIRED"

export interface Signer {
  signer_id: string
  signer_role: "ARTIST" | "VENUE"
  signer_name: string
  signed_at?: string
  ip_address?: string
}

export interface SignatureStatus {
  id: string
  contract_id: string
  zapSign_document_id?: string
  status: SignatureStatusType
  signers: Signer[]
  pdf_url?: string
  completed_at?: string
  created_at: string
  updated_at: string
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
  tags?: string | string[]
  genres?: string | string[]
  event_types?: string | string[]
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
