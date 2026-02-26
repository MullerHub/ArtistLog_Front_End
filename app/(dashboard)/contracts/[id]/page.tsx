'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUser } from '@/lib/auth';
import { contracts as contractsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contract } from '@/types';

const STATUS_BADGE_CLASS: Record<Contract['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

function StatusBadge({ status }: { status: Contract['status'] }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        STATUS_BADGE_CLASS[status],
      ].join(' ')}
    >
      {status}
    </span>
  );
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const user = getUser();
  const qc = useQueryClient();

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsApi.getContract(id!),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (status: Contract['status']) => contractsApi.updateContractStatus(id!, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract', id] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  if (isLoading) {
    return <p className="text-[var(--muted-foreground)]">Loading contract…</p>;
  }

  if (isError || !contract) {
    return <p className="text-red-600">Contract not found.</p>;
  }

  const myId = user?.id;
  const isCreator =
    (user?.role === 'ARTIST' && contract.artist_id === myId) ||
    (user?.role === 'VENUE' && contract.venue_id === myId);
  const isRecipient = !isCreator;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none focus:underline"
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Contract Details</h1>
      </div>

      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[var(--card-foreground)]">
              {contract.artist_name ?? 'Artist'} ↔ {contract.venue_name ?? 'Venue'}
            </CardTitle>
            <StatusBadge status={contract.status} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Parties */}
          <section aria-label="Parties">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="font-medium text-[var(--muted-foreground)]">Artist</dt>
                <dd className="text-[var(--foreground)]">{contract.artist_name ?? contract.artist_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--muted-foreground)]">Venue</dt>
                <dd className="text-[var(--foreground)]">{contract.venue_name ?? contract.venue_id}</dd>
              </div>
            </dl>
          </section>

          {/* Event details */}
          <section aria-label="Event details">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
              <div>
                <dt className="font-medium text-[var(--muted-foreground)]">Date</dt>
                <dd className="text-[var(--foreground)]">{contract.date}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--muted-foreground)]">Time</dt>
                <dd className="text-[var(--foreground)]">{contract.time}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--muted-foreground)]">Value</dt>
                <dd className="text-[var(--foreground)]">
                  R${' '}
                  {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </dd>
              </div>
            </dl>
          </section>

          {/* Details text */}
          {contract.details && (
            <section aria-label="Additional details">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Details</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--foreground)]">
                {contract.details}
              </p>
            </section>
          )}

          {/* Tags */}
          {contract.tags?.length > 0 && (
            <section aria-label="Tags">
              <p className="mb-1 text-sm font-medium text-[var(--muted-foreground)]">Tags</p>
              <div className="flex flex-wrap gap-1">
                {contract.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Created at */}
          <p className="text-xs text-[var(--muted-foreground)]">
            Created: {new Date(contract.created_at).toLocaleString()}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2" role="group" aria-label="Contract actions">
            {contract.status === 'PENDING' && isRecipient && (
              <>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate('ACCEPTED')}
                >
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate('REJECTED')}
                >
                  Reject
                </Button>
              </>
            )}

            {contract.status === 'PENDING' && isCreator && (
              <Button
                variant="outline"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate('CANCELLED')}
              >
                Cancel Contract
              </Button>
            )}

            {contract.status === 'ACCEPTED' && (
              <p className="text-sm font-medium text-green-600">
                ✓ Contract accepted — no further actions required.
              </p>
            )}
          </div>

          {updateStatus.isError && (
            <p role="alert" className="text-sm text-red-600">
              Action failed. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
