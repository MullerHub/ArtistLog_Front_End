'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { venues as venuesApi, reviews as reviewsApi } from '@/lib/api';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function VenueProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: venue, isLoading: venueLoading, isError } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => venuesApi.getVenueProfile(id),
    enabled: !!id,
  });

  const { data: venueReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['venue-reviews', id],
    queryFn: () => reviewsApi.getReviews(id),
    enabled: !!id,
  });

  if (venueLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <LoadingSkeleton variant="card" count={1} className="h-48" />
        <LoadingSkeleton variant="text" count={3} />
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--muted-foreground)]">
        <p className="text-lg font-medium">Venue not found</p>
        <Link href="/venues">
          <Button variant="outline">Back to Venues</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back link */}
      <Link href="/venues" className="text-sm text-[var(--muted-foreground)] hover:underline w-fit">
        ← Back to Venues
      </Link>

      {/* Profile card */}
      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardContent className="flex flex-col gap-4 pt-6">
          {/* Photo placeholder + basic info */}
          <div className="flex gap-4 items-start">
            <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
              🏛️
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{venue.venue_name}</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                📍 {venue.city}, {venue.state}
              </p>
              <p className="text-sm font-medium text-[var(--foreground)]">
                👥 Capacity: {venue.capacity}
              </p>
            </div>
          </div>

          {/* Bio */}
          {venue.bio && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">About</h2>
              <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{venue.bio}</p>
            </div>
          )}

          {/* Infrastructure tags */}
          {venue.infrastructure.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">Infrastructure</h2>
              <div className="flex flex-wrap gap-1">
                {venue.infrastructure.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2">
            <Link href={`/contracts/new?venue_id=${venue.id}`}>
              <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700">
                Propose Contract
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Reviews section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Reviews</h2>
        {reviewsLoading ? (
          <LoadingSkeleton variant="card" count={2} />
        ) : venueReviews.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No reviews yet.</p>
        ) : (
          venueReviews.map((review) => (
            <Card key={review.id} className="border-[var(--border)] bg-[var(--card)]">
              <CardContent className="flex flex-col gap-1 pt-4">
                <StarRating rating={review.rating} />
                <p className="text-sm text-[var(--muted-foreground)]">{review.comment}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(review.created_at).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
