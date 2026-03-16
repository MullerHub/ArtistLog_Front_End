import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AppNotification } from "@/types/notification";
import { notificationsService } from "@/services/notifications-service";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getDestination: (n: AppNotification) => string;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function resolveDestination(n: AppNotification): string {
  if (n.action_url) return n.action_url;
  if (n.entity_type && n.entity_id) {
    switch (n.entity_type) {
      case "artist": return `/artists/${n.entity_id}`;
      case "venue": return `/venues/${n.entity_id}`;
      case "booking": return "/contracts";
      case "review": return "/reviews";
    }
  }
  switch (n.type) {
    case "booking_request":
    case "booking_confirmed": return "/contracts";
    case "review_received": return "/reviews";
    case "message": return "/dashboard";
    case "system": return "/settings";
    default: return "/dashboard";
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await notificationsService.list({ limit: 30, offset: 0 });
      setNotifications(data);
    } catch {
      // Keep UI stable on transient API errors.
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationsService.markAsRead(id);
    } catch {
      // Ignore read failures to avoid blocking navigation.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsService.markAllAsRead();
    } catch {
      setNotifications(previous);
    }
  }, [notifications]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30_000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, getDestination: resolveDestination }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
