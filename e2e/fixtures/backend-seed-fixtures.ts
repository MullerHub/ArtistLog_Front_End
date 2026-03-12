export const seededArtistUser = {
  id: "user-artist-001",
  email: "dj.silva@example.com",
  role: "ARTIST",
  created_at: "2026-01-15T10:30:00Z",
  updated_at: "2026-02-12T14:45:00Z",
}

export const seededArtists = [
  {
    id: "user-artist-001",
    stage_name: "DJ Silva",
    is_available: true,
    rating: 4.8,
    tags: ["eletronico", "house", "techno", "deep house"],
    cache_base: 500,
    created_at: "2026-01-15T10:30:00Z",
    updated_at: "2026-02-12T14:45:00Z",
  },
  {
    id: "user-artist-002",
    stage_name: "Lucas & Friends",
    is_available: true,
    rating: 4.6,
    tags: ["indie", "rock", "alternativo", "pop-rock"],
    cache_base: 800,
    created_at: "2026-01-20T08:15:00Z",
    updated_at: "2026-02-10T11:20:00Z",
  },
  {
    id: "user-artist-003",
    stage_name: "Ana Costa",
    is_available: true,
    rating: 4.9,
    tags: ["mpb", "samba", "bossa nova", "jazz"],
    cache_base: 600,
    created_at: "2026-02-01T16:00:00Z",
    updated_at: "2026-02-12T09:30:00Z",
  },
] as const
