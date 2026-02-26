'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/lib/auth';
import { contracts, scheduleSlots, notifications, artists, venues } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--card)]">
      <CardContent className="pt-6">
        <p className="text-3xl font-bold text-[var(--primary)]">{value}</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = getUser();
  const role = user?.role;

  const { data: contractList = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: contracts.getContracts,
  });

  const { data: slots = [] } = useQuery({
    queryKey: ['schedule-slots'],
    queryFn: scheduleSlots.getScheduleSlots,
    enabled: role === 'ARTIST',
  });

  const { data: notifList = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notifications.getNotifications,
  });

  const { data: artistProfile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: () => artists.getArtistProfile(),
    enabled: role === 'ARTIST',
  });

  const { data: venueProfile } = useQuery({
    queryKey: ['venue-profile'],
    queryFn: () => venues.getVenueProfile(),
    enabled: role === 'VENUE',
  });

  const displayName =
    role === 'ARTIST'
      ? (artistProfile?.stage_name ?? user?.email ?? 'Artist')
      : (venueProfile?.venue_name ?? user?.email ?? 'Venue');

  const totalContracts = contractList.length;
  const pendingContracts = contractList.filter((c) => c.status === 'PENDING').length;
  const unreadNotifications = notifList.filter((n) => !n.read).length;
  const upcomingSlots = slots.filter((s) => s.available).length;

  const recentNotifications = notifList.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Olá, {displayName} 👋
        </h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          {role === 'ARTIST' ? 'Gerencie suas reservas e agenda.' : 'Gerencie seu venue e artistas.'}
        </p>
      </div>

      {/* Stats */}
      <section aria-label="Quick stats">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Visão Geral
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total de Contratos" value={totalContracts} />
          <StatCard label="Contratos Pendentes" value={pendingContracts} />
          {role === 'ARTIST' ? (
            <StatCard label="Slots Disponíveis" value={upcomingSlots} />
          ) : (
            <StatCard label="Artistas Parceiros" value="—" />
          )}
          <StatCard label="Notificações Não Lidas" value={unreadNotifications} />
        </div>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          {role === 'ARTIST' ? (
            <>
              <Link href="/venues">
                <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700">
                  Encontrar Venues
                </Button>
              </Link>
              <Link href="/community-venues">
                <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]">
                  Criar Venue da Comunidade
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]">
                  Gerenciar Agenda
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/artists">
                <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700">
                  Encontrar Artistas
                </Button>
              </Link>
              <Link href="/contracts">
                <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]">
                  Publicar Contrato
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Recent notifications */}
      <section aria-label="Recent notifications">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Notificações Recentes
          </h2>
          <Link
            href="/notifications"
            className="text-xs text-[var(--primary)] hover:underline focus:outline-none focus:underline"
          >
            Ver todas
          </Link>
        </div>
        {recentNotifications.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Nenhuma notificação ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentNotifications.map((n: Notification) => (
              <Card
                key={n.id}
                className={[
                  'border-[var(--border)]',
                  n.read ? 'bg-[var(--card)]' : 'bg-[var(--secondary)]',
                ].join(' ')}
              >
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-[var(--card-foreground)]">{n.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <p className="text-sm text-[var(--muted-foreground)]">{n.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
