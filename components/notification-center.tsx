"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWebSocket } from "@/hooks/use-websocket"
import { getNotificationIcon, isNotificationNavigable, resolveNotificationHref } from "@/lib/notification-routing"
import { notificationsService } from "@/lib/services/notifications.service"
import type { Notification } from "@/lib/services/notifications.service"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function NotificationCenter() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // WebSocket connection for real-time notifications
  const { isConnected, lastMessage } = useWebSocket()

  // Load notifications when dropdown opens
  const loadNotifications = useCallback(async () => {
    if (!isOpen) return

    setIsLoading(true)
    try {
      const data = await notificationsService.getNotifications({ limit: 20, offset: 0 })
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [isOpen])

  // Load unread count on mount and when notifications change
  const loadUnreadCount = useCallback(async () => {
    try {
      const { count } = await notificationsService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading unread count:", error)
    }
  }, [])

  // Handle new WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "notification") {
      const newNotification = lastMessage.payload as unknown as Notification
      
      // Add to notifications list
      setNotifications(prev => [newNotification, ...prev])
      
      // Increment unread count
      setUnreadCount(prev => prev + 1)

      // Show toast notification (optional)
      // toast(newNotification.title, { description: newNotification.message })
    }
  }, [lastMessage])

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen, loadNotifications])

  // Load unread count on mount
  useEffect(() => {
    loadUnreadCount()
  }, [loadUnreadCount])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId)
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id)
    }

    const href = resolveNotificationHref(notification)
    setIsOpen(false)
    router.push(href)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Abrir notificações"
          data-testid="notification-bell"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              data-testid="notification-badge"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {isConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success border border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96" data-testid="notification-dropdown">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold" data-testid="notification-dropdown-title">Notificações</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => void handleNotificationClick(notification)}
                  data-testid="notification-item"
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-info flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                        {isNotificationNavigable(notification) && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                            Abrir
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
