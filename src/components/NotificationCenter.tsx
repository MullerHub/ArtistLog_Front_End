import { Bell, Check, CheckCheck, BookOpen, Star, MessageSquare, Settings } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

function notificationIcon(type: AppNotification["type"]) {
  switch (type) {
    case "booking_request":
    case "booking_confirmed": return BookOpen;
    case "review_received": return Star;
    case "message": return MessageSquare;
    case "system": return Settings;
    default: return Bell;
  }
}

function timeAgo(dateStr: string, t: (key: string) => string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("common.now");
  if (mins < 60) return `${mins}${t("common.min")}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t("common.hour")}`;
  return `${Math.floor(hrs / 24)}${t("common.day")}`;
}

export function NotificationCenter() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, getDestination } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (n: AppNotification) => {
    markAsRead(n.id);
    navigate(getDestination(n));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-strong rounded-xl" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="font-heading font-semibold text-sm">{t("notifications.title")}</h4>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" /> {t("notifications.markAll")}
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {t("notifications.none")}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = notificationIcon(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      !n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-tight", !n.read && "font-medium text-foreground")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_at, t)}</span>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
