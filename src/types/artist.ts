export interface Artist {
  id: string;
  stage_name: string;
  email: string;
  bio?: string;
  about_me?: string;
  tags: string[];
  genres: string[];
  event_types: string[];
  phone?: string;
  whatsapp?: string;
  website?: string;
  soundcloud_links: string[];
  photo_urls: string[];
  profile_photo?: string;
  cache_base: number;
  city: string;
  state: string;
  rating: number;
  review_count: number;
  is_available: boolean;
  created_at: string;
  // Preferences
  email_notifications?: boolean;
  push_notifications?: boolean;
  auto_accept?: boolean;
  is_public?: boolean;
}

export interface ArtistFilters {
  search: string;
  genres: string[];
  event_types: string[];
  availability: "all" | "available" | "unavailable";
  state: string;
  city: string;
  min_cache: number;
  max_cache: number;
}

export interface ScheduleSlot {
  id: string;
  day_of_week: number; // 0=Sun, 6=Sat
  start_time: string; // "HH:mm"
  end_time: string;   // "HH:mm"
  is_available: boolean;
  label?: string;
}

export interface ScheduleSettings {
  advance_booking_days: number;
  min_slot_duration_hours: number;
  auto_accept: boolean;
}

export const GENRES = [
  "Sertanejo", "Pagode", "Samba", "Forró", "MPB", "Rock", "Pop",
  "Funk", "Eletrônica", "Jazz", "Blues", "Reggae", "Axé", "Gospel", "Hip-Hop",
];

export const EVENT_TYPES = [
  "Casamento", "Formatura", "Aniversário", "Corporativo", "Festival",
  "Bar/Pub", "Restaurante", "Show Privado", "Evento Público",
];

export const DAYS_OF_WEEK = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];
