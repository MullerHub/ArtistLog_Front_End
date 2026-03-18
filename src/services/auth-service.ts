import { apiClient } from "@/lib/api-client";
import type {
  LoginRequest,
  SignUpArtistRequest,
  SignUpVenueRequest,
  AuthResponse,
  UserResponse,
} from "@/types/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
    });
    localStorage.setItem("artistlog_token", response.access_token);
    localStorage.setItem("artistlog_user", JSON.stringify(response.user));
    return response;
  },

  async signupArtist(data: SignUpArtistRequest): Promise<AuthResponse> {
    const response = await apiClient<AuthResponse>("/auth/signup/artist", {
      method: "POST",
      body: data,
      auth: false,
    });
    localStorage.setItem("artistlog_token", response.access_token);
    localStorage.setItem("artistlog_user", JSON.stringify(response.user));
    return response;
  },

  async signupVenue(data: SignUpVenueRequest): Promise<AuthResponse> {
    const response = await apiClient<AuthResponse>("/auth/signup/venue", {
      method: "POST",
      body: data,
      auth: false,
    });
    localStorage.setItem("artistlog_token", response.access_token);
    localStorage.setItem("artistlog_user", JSON.stringify(response.user));
    return response;
  },

  async getMe(): Promise<UserResponse> {
    return apiClient<UserResponse>("/auth/me", { method: "GET" });
  },

  logout() {
    localStorage.removeItem("artistlog_token");
    localStorage.removeItem("artistlog_user");
  },

  getStoredUser(): UserResponse | null {
    try {
      const raw = localStorage.getItem("artistlog_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    try {
      return localStorage.getItem("artistlog_token");
    } catch {
      return null;
    }
  },
};
