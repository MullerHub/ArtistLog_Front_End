import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserResponse, LoginRequest } from "@/types/auth";
import { authService } from "@/services/auth-service";
import { Loader2 } from "lucide-react";

interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await authService.getMe();
      setUser(me);
      localStorage.setItem("artistlog_user", JSON.stringify(me));
    } catch {
      setUser(null);
      authService.logout();
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = authService.getStoredUser();
      if (stored) setUser(stored);

      const token = authService.getToken();
      if (token) {
        try {
          const me = await authService.getMe();
          setUser(me);
          localStorage.setItem("artistlog_user", JSON.stringify(me));
        } catch {
          setUser(null);
          authService.logout();
        }
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    window.location.href = "/login";
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
