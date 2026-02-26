import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--primary)]">ArtistLog</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Connect Artists &amp; Venues</p>
        </div>
        {children}
      </div>
    </div>
  );
}
