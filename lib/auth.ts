import type { User } from '@/types';

/** Retrieve the stored JWT from localStorage (SSR-safe). */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/** Persist a JWT to localStorage. */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/** Remove the stored JWT (i.e. log out). */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

/**
 * Decode the JWT payload and return a User object.
 * Returns null if no token is present or the payload is malformed.
 *
 * ⚠️  This only decodes the payload for reading display-level claims (role, email).
 * Signature verification and all authorisation decisions MUST be enforced server-side.
 */
export function getUser(): User | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // atob works in both browser and modern Node (>=16)
    const decoded = JSON.parse(atob(payload));
    return decoded as User;
  } catch {
    return null;
  }
}

/** Returns true when a non-expired token exists in storage. */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    if (exp === undefined) return true;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

/** Returns the role stored in the JWT payload, or null if unavailable. */
export function getUserRole(): 'ARTIST' | 'VENUE' | null {
  const user = getUser();
  return user?.role ?? null;
}
