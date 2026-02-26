'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { artists as artistsApi, reviews as reviewsApi } from '@/lib/api';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: artist, isLoading: artistLoading, isError } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => artistsApi.getArtistProfile(id),
    enabled: !!id,
  });

  const { data: artistReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['artist-reviews', id],
    queryFn: () => reviewsApi.getReviews(id),
    enabled: !!id,
  });

  if (artistLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <LoadingSkeleton variant="card" count={1} className="h-48" />
        <LoadingSkeleton variant="text" count={3} />
      </div>
    );
  }

  if (isError || !artist) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--muted-foreground)]">
        <p className="text-lg font-medium">Artist not found</p>
        <Link href="/artists">
          <Button variant="outline">Back to Artists</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back link */}
      <Link href="/artists" className="text-sm text-[var(--muted-foreground)] hover:underline w-fit">
        ← Back to Artists
      </Link>

      {/* Profile card */}
      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardContent className="flex flex-col gap-4 pt-6">
          {/* Photo placeholder + basic info */}
          <div className="flex gap-4 items-start">
            <div className="h-24 w-24 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
              🎤
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{artist.stage_name}</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                📍 {artist.city}, {artist.state}
              </p>
              <p className="text-sm font-medium text-[var(--foreground)]">
                💰 {formatCurrency(artist.cache_base)} por show
              </p>
            </div>
          </div>

          {/* Bio */}
          {artist.bio && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">About</h2>
              <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{artist.bio}</p>
            </div>
          )}

          {/* Genre tags */}
          {artist.tags.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">Genres</h2>
              <div className="flex flex-wrap gap-1">
                {artist.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2">
            <Link href={`/contracts/new?artist_id=${artist.id}`}>
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
        ) : artistReviews.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No reviews yet.</p>
        ) : (
          artistReviews.map((review) => (
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
