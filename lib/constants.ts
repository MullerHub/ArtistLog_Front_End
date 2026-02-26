import type { NotificationType } from '@/types';

/** Contractual add-ons that can be negotiated as part of a booking. */
export const CONTRACT_TAGS: string[] = [
  'Transport',
  'Effects',
  'Lodging',
  'Meals',
  'Equipment',
  'Crew',
];

/** All valid notification type identifiers, kept in sync with the backend enum. */
export const NOTIFICATION_TYPES: NotificationType[] = [
  'CONTRACT_PROPOSAL',
  'CONTRACT_STATUS_CHANGE',
  'REVIEW_RECEIVED',
  'COMMUNITY_VENUE_CLAIMED',
  'WELCOME',
];

/** Base URL for the ArtistLog API, configurable per environment. */
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
