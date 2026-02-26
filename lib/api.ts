import axios from 'axios';
import type {
  AuthResponse,
  ArtistProfile,
  VenueProfile,
  CommunityVenue,
  Contract,
  ScheduleSlot,
  Review,
  Notification,
  NotificationPreferences,
  City,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** Attach the stored JWT to every outgoing request. */
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/** On 401, clear credentials and redirect to login.
 *  window.location.href is intentional here: this interceptor runs outside React's
 *  component tree, so Next.js router hooks are unavailable. The hard redirect also
 *  ensures stale in-memory state is fully reset.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const auth = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  signup: (email: string, password: string, role: 'ARTIST' | 'VENUE') =>
    apiClient.post<AuthResponse>('/auth/signup', { email, password, role }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Artists
// ---------------------------------------------------------------------------

export const artists = {
  /** Fetch the authenticated user's profile when no id is provided. */
  getArtistProfile: (id?: string) =>
    apiClient.get<ArtistProfile>(id ? `/artists/${id}` : '/artists/me').then((r) => r.data),

  updateArtistProfile: (data: Partial<ArtistProfile>) =>
    apiClient.put<ArtistProfile>('/artists/me', data).then((r) => r.data),

  /** Search artists by city, with optional radius in km. */
  searchArtists: (city: string, radius?: number) =>
    apiClient
      .get<ArtistProfile[]>('/artists/search', { params: { city, radius } })
      .then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Venues
// ---------------------------------------------------------------------------

export const venues = {
  /** Fetch the authenticated user's profile when no id is provided. */
  getVenueProfile: (id?: string) =>
    apiClient.get<VenueProfile>(id ? `/venues/${id}` : '/venues/me').then((r) => r.data),

  updateVenueProfile: (data: Partial<VenueProfile>) =>
    apiClient.put<VenueProfile>('/venues/me', data).then((r) => r.data),

  /** Search venues by city, with optional radius in km. */
  searchVenues: (city: string, radius?: number) =>
    apiClient
      .get<VenueProfile[]>('/venues/search', { params: { city, radius } })
      .then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Community Venues
// ---------------------------------------------------------------------------

export const communityVenues = {
  createCommunityVenue: (data: Omit<CommunityVenue, 'id' | 'status' | 'created_at'>) =>
    apiClient.post<CommunityVenue>('/community-venues', data).then((r) => r.data),

  getCommunityVenues: () =>
    apiClient.get<CommunityVenue[]>('/community-venues').then((r) => r.data),

  /** Returns community venues eligible to be claimed by the current user. */
  getClaimCandidates: () =>
    apiClient.get<CommunityVenue[]>('/community-venues/claim-candidates').then((r) => r.data),

  claimCommunityVenue: (id: string) =>
    apiClient.post<CommunityVenue>(`/community-venues/${id}/claim`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------

export const contracts = {
  getContracts: () =>
    apiClient.get<Contract[]>('/contracts').then((r) => r.data),

  getContract: (id: string) =>
    apiClient.get<Contract>(`/contracts/${id}`).then((r) => r.data),

  createContract: (data: Omit<Contract, 'id' | 'status' | 'created_at'>) =>
    apiClient.post<Contract>('/contracts', data).then((r) => r.data),

  updateContractStatus: (id: string, status: Contract['status']) =>
    apiClient.patch<Contract>(`/contracts/${id}/status`, { status }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Schedule Slots
// ---------------------------------------------------------------------------

export const scheduleSlots = {
  getScheduleSlots: () =>
    apiClient.get<ScheduleSlot[]>('/schedule-slots').then((r) => r.data),

  createScheduleSlot: (data: Omit<ScheduleSlot, 'id'>) =>
    apiClient.post<ScheduleSlot>('/schedule-slots', data).then((r) => r.data),

  updateScheduleSlot: (id: string, data: Partial<Omit<ScheduleSlot, 'id' | 'artist_id'>>) =>
    apiClient.put<ScheduleSlot>(`/schedule-slots/${id}`, data).then((r) => r.data),

  deleteScheduleSlot: (id: string) =>
    apiClient.delete(`/schedule-slots/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const reviews = {
  getReviews: (venueId: string) =>
    apiClient.get<Review[]>('/reviews', { params: { venue_id: venueId } }).then((r) => r.data),

  createReview: (data: Omit<Review, 'id' | 'created_at'>) =>
    apiClient.post<Review>('/reviews', data).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notifications = {
  getNotifications: () =>
    apiClient.get<Notification[]>('/notifications').then((r) => r.data),

  markNotificationRead: (id: string) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllNotificationsRead: () =>
    apiClient.patch('/notifications/read-all').then((r) => r.data),

  getNotificationPreferences: () =>
    apiClient.get<NotificationPreferences[]>('/notifications/preferences').then((r) => r.data),

  updateNotificationPreferences: (data: Partial<NotificationPreferences>) =>
    apiClient
      .put<NotificationPreferences>('/notifications/preferences', data)
      .then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export const cities = {
  searchCities: (query: string) =>
    apiClient.get<City[]>('/cities/search', { params: { query } }).then((r) => r.data),
};
