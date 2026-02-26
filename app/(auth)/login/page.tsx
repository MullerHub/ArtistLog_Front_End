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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiAuth.login(email, password);
      setToken(data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]">
      <CardHeader>
        <CardTitle className="text-[var(--card-foreground)]">Sign in</CardTitle>
        <CardDescription className="text-[var(--muted-foreground)]">
          Enter your credentials to access your account
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
              autoComplete="current-password"
              required
              tabIndex={0}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              tabIndex={0}
              className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
            />
            <Label htmlFor="remember" className="text-sm text-[var(--muted-foreground)] cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            tabIndex={0}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
          >
            {loading ? 'Signing in…' : 'Log in'}
          </Button>

          <p className="text-center text-sm text-[var(--muted-foreground)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              tabIndex={0}
              className="text-[var(--primary)] hover:underline focus:outline-none focus:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
