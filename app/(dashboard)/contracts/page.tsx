'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUser } from '@/lib/auth';
import { contracts as contractsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contract } from '@/types';

type StatusFilter = 'ALL' | Contract['status'];

const STATUS_TABS: StatusFilter[] = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

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

export default function ContractsPage() {
  const user = getUser();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const { data: allContracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsApi.getContracts,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Contract['status'] }) =>
      contractsApi.updateContractStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });

  const filtered =
    filter === 'ALL' ? allContracts : allContracts.filter((c) => c.status === filter);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Contracts</h1>
        <Link href="/contracts/new">
          <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700">
            + New Contract
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div role="tablist" aria-label="Filter contracts by status" className="flex gap-1 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={filter === tab}
            onClick={() => setFilter(tab)}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
              filter === tab
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-[var(--muted-foreground)]">Loading contracts…</p>
      ) : filtered.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No contracts found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((contract) => {
            const counterpartyName =
              user?.role === 'ARTIST' ? contract.venue_name : contract.artist_name;
            const isRecipient =
              (user?.role === 'ARTIST' && contract.venue_id !== user?.id) ||
              (user?.role === 'VENUE' && contract.artist_id !== user?.id);

            return (
              <Card key={contract.id} className="border-[var(--border)] bg-[var(--card)]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-[var(--card-foreground)]">
                      {counterpartyName ?? '—'}
                    </CardTitle>
                    <StatusBadge status={contract.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
                    <span>📅 {contract.date}</span>
                    <span>🕐 {contract.time}</span>
                    <span>
                      💰 R${' '}
                      {contract.value.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {contract.details && (
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                      {contract.details}
                    </p>
                  )}

                  {contract.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {contract.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Link href={`/contracts/${contract.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>

                    {contract.status === 'PENDING' && isRecipient && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({ id: contract.id, status: 'ACCEPTED' })
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({ id: contract.id, status: 'REJECTED' })
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
