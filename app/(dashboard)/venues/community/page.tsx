'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUser } from '@/lib/auth';
import { communityVenues as communityVenuesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CommunityVenue } from '@/types';

const STATUS_CLASS: Record<CommunityVenue['status'], string> = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  CLAIMED: 'bg-gray-100 text-gray-700',
};

function StatusBadge({ status }: { status: CommunityVenue['status'] }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        STATUS_CLASS[status],
      ].join(' ')}
    >
      {status}
    </span>
  );
}

export default function CommunityVenuesPage() {
  const user = getUser();
  const role = user?.role;
  const qc = useQueryClient();
  const [cityFilter, setCityFilter] = useState('');

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['community-venues'],
    queryFn: communityVenuesApi.getCommunityVenues,
  });

  const claimMutation = useMutation({
    mutationFn: (id: string) => communityVenuesApi.claimCommunityVenue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-venues'] }),
  });

  const filtered = cityFilter
    ? venues.filter((v) =>
        v.city.toLowerCase().includes(cityFilter.toLowerCase()),
      )
    : venues;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Community Venues</h1>
        {role === 'ARTIST' && (
          <Link href="/venues/community/new">
            <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700">
              + Add Venue
            </Button>
          </Link>
        )}
      </div>

      {/* City filter */}
      <div className="flex flex-col gap-1 max-w-xs">
        <Label htmlFor="city_filter">Filter by City</Label>
        <Input
          id="city_filter"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          placeholder="e.g. São Paulo"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-[var(--muted-foreground)]">Loading venues…</p>
      ) : filtered.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No community venues found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((venue) => (
            <Card key={venue.id} className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base text-[var(--card-foreground)]">
                    {venue.name}
                  </CardTitle>
                  <StatusBadge status={venue.status} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                  <span>📍 {venue.city}, {venue.state}</span>
                  {venue.capacity > 0 && <span>👥 {venue.capacity}</span>}
                </div>

                {venue.description && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                    {venue.description}
                  </p>
                )}

                {role === 'VENUE' && venue.status === 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={claimMutation.isPending}
                    onClick={() => claimMutation.mutate(venue.id)}
                    className="self-start"
                  >
                    Claim Venue
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
