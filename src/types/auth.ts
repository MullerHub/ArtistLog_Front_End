export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpArtistRequest {
  stage_name: string;
  email: string;
  password: string;
  bio?: string;
  about_me?: string;
  tags?: string[];
  genres?: string[];
  event_types?: string[];
  phone?: string;
  whatsapp?: string;
  website?: string;
  soundcloud_links?: string[];
  photo_urls?: string[];
  profile_photo?: string;
  cache_base: number;
  city: string;
  state: string;
}

export interface SignUpVenueRequest {
  venue_name: string;
  email: string;
  password: string;
  capacity: number;
  infrastructure: string;
  city: string;
  state: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  role: "ARTIST" | "VENUE";
  created_at: string;
  updated_at: string;
}
