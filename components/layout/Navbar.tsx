'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { getUser, removeToken } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavLink {
  href: string;
  label: string;
}

const commonLinks: NavLink[] = [
  { href: '/dashboard', label: 'Painel' },
  { href: '/profile', label: 'Perfil' },
  { href: '/contracts', label: 'Contratos' },
];

const artistLinks: NavLink[] = [
  { href: '/schedule', label: 'Minha Agenda' },
  { href: '/venues', label: 'Venues' },
  { href: '/community-venues', label: 'Venues da Comunidade' },
];

const venueLinks: NavLink[] = [
  { href: '/artists', label: 'Artistas' },
  { href: '/schedule-requests', label: 'Pedidos de Agenda' },
];

interface NavbarProps {
  unreadCount?: number;
}

export const Navbar = ({ unreadCount = 0 }: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const role = user?.role;

  const roleLinks = role === 'ARTIST' ? artistLinks : role === 'VENUE' ? venueLinks : [];
  const allLinks = [...commonLinks, ...roleLinks];

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const linkClass = (href: string) =>
    [
      'text-sm font-medium transition-colors focus:outline-none focus:underline',
      pathname === href || pathname.startsWith(href + '/')
        ? 'text-gray-900 underline underline-offset-4'
        : 'text-gray-500 hover:text-gray-900',
    ].join(' ');

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 font-bold text-gray-900 focus:outline-none focus:underline"
          tabIndex={0}
        >
          ArtistLog
        </Link>

        {/* Nav links */}
        <div className="flex flex-1 items-center gap-4 overflow-x-auto" role="list">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
              tabIndex={0}
              role="listitem"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
          className="relative flex items-center text-gray-500 hover:text-gray-900 focus:outline-none focus:underline"
          tabIndex={0}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Link>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          tabIndex={0}
          aria-label="Sair"
        >
          Sair
        </Button>
      </div>
    </nav>
  );
};
