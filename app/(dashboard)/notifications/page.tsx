'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notifications as notificationsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import type { NotificationPreferences, NotificationType } from '@/types';

const NOTIFICATION_TYPES: NotificationType[] = [
  'CONTRACT_PROPOSAL',
  'CONTRACT_STATUS_CHANGE',
  'REVIEW_RECEIVED',
  'COMMUNITY_VENUE_CLAIMED',
  'WELCOME',
];

const FRIENDLY_NAMES: Record<NotificationType, string> = {
  CONTRACT_PROPOSAL: 'Proposta de Contrato',
  CONTRACT_STATUS_CHANGE: 'Mudança de Status do Contrato',
  REVIEW_RECEIVED: 'Avaliação Recebida',
  COMMUNITY_VENUE_CLAIMED: 'Venue da Comunidade Reivindicado',
  WELCOME: 'Boas-vindas',
};

type FilterType = 'all' | 'unread';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences[] | null>(null);

  const { data: allNotifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });

  const { data: prefsData, isLoading: prefsLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: notificationsApi.getNotificationPreferences,
  });

  // Sync server prefs into local state once loaded (only on first load)
  useEffect(() => {
    if (prefsData && localPrefs === null) {
      setLocalPrefs(prefsData);
    }
  }, [prefsData, localPrefs]);

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const savePrefs = useMutation({
    mutationFn: async (prefs: NotificationPreferences[]) => {
      await Promise.all(prefs.map((p) => notificationsApi.updateNotificationPreferences(p)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({ title: 'Preferências salvas', variant: 'success' });
    },
    onError: () => {
      toast({ title: 'Falha ao salvar preferências', variant: 'destructive' });
    },
  });

  const unreadCount = allNotifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? allNotifications.filter((n) => !n.read) : allNotifications;

  // Merge server prefs with defaults for any missing types
  const basePrefs = localPrefs ?? prefsData ?? [];
  const allPrefs: NotificationPreferences[] = NOTIFICATION_TYPES.map((type) => {
    const existing = basePrefs.find((p) => p.type === type);
    return existing ?? { user_id: '', type, email_enabled: true, push_enabled: true, in_app_enabled: true };
  });

  const updateLocalPref = (
    type: string,
    field: 'email_enabled' | 'push_enabled' | 'in_app_enabled',
    value: boolean,
  ) => {
    setLocalPrefs(allPrefs.map((p) => (p.type === type ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Central de Notificações</h1>
          {unreadCount > 0 && (
            <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)]">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">Todas as Notificações</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
        </TabsList>

        {/* All Notifications tab */}
        <TabsContent value="notifications">
          {/* Filter buttons */}
          <div className="flex gap-2 mb-4 mt-4" role="group" aria-label="Filtrar notificações">
            {(['all', 'unread'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={[
                  'rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
                  filter === f
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]',
                ].join(' ')}
              >
                {f === 'all' ? 'Todas' : 'Não lidas'}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-[var(--muted)] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-[var(--muted-foreground)]">
              <Bell className="h-10 w-10" aria-hidden="true" />
              <p>Nenhuma notificação ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markRead.mutate(id)}
                  isMarkingRead={markRead.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Preferences tab */}
        <TabsContent value="preferences">
          {prefsLoading ? (
            <div className="flex flex-col gap-3 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-[var(--muted)] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                      <th className="text-left px-4 py-3 font-medium">Tipo de Notificação</th>
                      <th className="text-center px-4 py-3 font-medium">E-mail</th>
                      <th className="text-center px-4 py-3 font-medium">Push</th>
                      <th className="text-center px-4 py-3 font-medium">No App</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {allPrefs.map((pref) => (
                      <tr key={pref.type} className="bg-[var(--card)] hover:bg-[var(--muted)]">
                        <td className="px-4 py-3 text-[var(--card-foreground)]">
                          {FRIENDLY_NAMES[pref.type as NotificationType] ?? pref.type}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={pref.email_enabled}
                            onCheckedChange={(v) => updateLocalPref(pref.type, 'email_enabled', Boolean(v))}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={pref.push_enabled}
                            onCheckedChange={(v) => updateLocalPref(pref.type, 'push_enabled', Boolean(v))}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={pref.in_app_enabled}
                            onCheckedChange={(v) =>
                              updateLocalPref(pref.type, 'in_app_enabled', Boolean(v))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
                  disabled={savePrefs.isPending}
                  onClick={() => savePrefs.mutate(allPrefs)}
                >
                  {savePrefs.isPending ? 'Salvando…' : 'Salvar Preferências'}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
