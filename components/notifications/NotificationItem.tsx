'use client';

import React from 'react';
import { FileText, RefreshCw, Star, MapPin, Heart, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { Notification, NotificationType } from '@/types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  CONTRACT_PROPOSAL: FileText,
  CONTRACT_STATUS_CHANGE: RefreshCw,
  REVIEW_RECEIVED: Star,
  COMMUNITY_VENUE_CLAIMED: MapPin,
  WELCOME: Heart,
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isMarkingRead: boolean;
}

export function NotificationItem({ notification, onMarkRead, isMarkingRead }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type];
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  const handleMarkRead = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
  };

  return (
    <article
      role="article"
      aria-label={`${notification.title} – ${notification.read ? 'read' : 'unread'}`}
      tabIndex={0}
      onClick={handleMarkRead}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleMarkRead();
        }
      }}
      className={[
        'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
        notification.read
          ? 'border-[var(--border)] bg-[var(--card)]'
          : 'border-violet-300 bg-[var(--card)] hover:bg-[var(--muted)]',
      ].join(' ')}
    >
      {/* Unread indicator dot */}
      <span
        className={[
          'mt-2 h-2 w-2 shrink-0 rounded-full',
          notification.read ? 'bg-transparent' : 'bg-[var(--primary)]',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* Type icon */}
      <div className="shrink-0 rounded-full bg-[var(--muted)] p-2">
        <Icon className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={['text-sm', notification.read ? 'font-normal' : 'font-bold'].join(' ')}>
          {notification.title}
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{notification.message}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">{timeAgo}</p>
      </div>

      {/* Mark as read button */}
      {!notification.read && (
        <Button
          variant="outline"
          size="sm"
          disabled={isMarkingRead}
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          aria-label={`Mark "${notification.title}" as read`}
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
    </article>
  );
}
