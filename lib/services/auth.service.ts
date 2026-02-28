import { apiClient, setToken, removeToken } from "@/lib/api-client"
import { mergeArtistTagFields } from "@/lib/services/artist-tags"
import type {
  AuthResponse,
  LoginRequest,
  SignUpArtistRequest,
  SignUpVenueRequest,
  UserResponse,
} from "@/lib/types"

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const data = await apiClient.post<AuthResponse>("/auth/login", credentials)
    setToken(data.access_token)
    if (typeof window !== "undefined") {
      localStorage.setItem("artistlog_user", JSON.stringify(data.user))
    }
    return data
  },

  async signupArtist(payload: SignUpArtistRequest): Promise<AuthResponse> {
    const mergedTags = mergeArtistTagFields(payload)
    const normalizedPayload: SignUpArtistRequest = {
      ...payload,
      // Map bio to about_me for backend compatibility
      about_me: payload.bio || payload.about_me,
      bio: undefined,
      ...(mergedTags.length > 0
        ? {
            tags: mergedTags,
            genres: mergedTags,
            event_types: mergedTags,
          }
        : {}),
    }

    return apiClient.post<AuthResponse>("/auth/signup/artist", normalizedPayload)
  },

  async signupVenue(payload: SignUpVenueRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/signup/venue", payload)
  },

  async getMe(): Promise<UserResponse> {
    return apiClient.get<UserResponse>("/auth/me")
  },

  logout(): void {
    removeToken()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  },

  getStoredUser(): UserResponse | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("artistlog_user")
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserResponse
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("artistlog_token")
  },
}
