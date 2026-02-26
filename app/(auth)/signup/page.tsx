'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth as apiAuth } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Role = 'ARTIST' | 'VENUE';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('ARTIST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiAuth.signup(email, password, role);
      setToken(data.token);
      router.push('/profile');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create account. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]">
      <CardHeader>
        <CardTitle className="text-[var(--card-foreground)]">Create an account</CardTitle>
        <CardDescription className="text-[var(--muted-foreground)]">
          Join ArtistLog to connect with artists and venues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[var(--card-foreground)]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              tabIndex={0}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[var(--card-foreground)]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              tabIndex={0}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword" className="text-[var(--card-foreground)]">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              tabIndex={0}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          {/* Role selection */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-[var(--card-foreground)]">
              I am a…
            </legend>
            <div className="flex gap-3">
              {(['ARTIST', 'VENUE'] as Role[]).map((r) => (
                <label
                  key={r}
                  className={[
                    'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
                    role === r
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    tabIndex={0}
                    className="sr-only"
                  />
                  {r === 'ARTIST' ? '🎵' : '🏟️'}
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                  {role === r && (
                    <Badge className="ml-1 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs">
                      Selected
                    </Badge>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          <Button
            type="submit"
            disabled={loading}
            tabIndex={0}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Already have an account?{' '}
            <Link
              href="/login"
              tabIndex={0}
              className="text-[var(--primary)] hover:underline focus:outline-none focus:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
