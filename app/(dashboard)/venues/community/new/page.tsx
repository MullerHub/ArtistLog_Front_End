'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { CommunityVenueForm } from '@/components/community-venues/CommunityVenueForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewCommunityVenuePage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (user?.role === 'VENUE') {
      router.replace('/venues/community');
    }
  }, [user, router]);

  if (user?.role === 'VENUE') {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Add Community Venue</h1>
      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--card-foreground)]">Venue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CommunityVenueForm onSuccess={() => router.push('/venues/community')} />
        </CardContent>
      </Card>
    </div>
  );
}
