"use client"

import React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Music,
  LayoutDashboard,
  Mic,
  Building2,
  Calendar,
  Star,
  LogOut,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { NotificationCenter } from "@/components/notification-center"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: ("ARTIST" | "VENUE")[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Artistas", href: "/artists", icon: Mic },
  { label: "Contratantes", href: "/venues", icon: Building2 },
  { label: "Agenda", href: "/schedule", icon: Calendar, roles: ["ARTIST"] },
  // ⚠️ OCULTO NO MVP v1.0: Contratos será habilitado em v1.1+ após refinamento da UX
  // { label: "Contratos", href: "/contracts", icon: FileText },
  { label: "Avaliacoes", href: "/reviews", icon: Star },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  )

  React.useEffect(() => {
    // Warm the route cache for primary nav targets to make transitions feel instant.
    filteredItems.forEach((item) => router.prefetch(item.href))
  }, [filteredItems, router])

  return (
    <aside className="hidden w-64 flex-col border-r border-sidebar-border text-white dark:text-sidebar-foreground bg-gradient-to-b from-[hsl(272,48%,46%)] to-[hsl(272,40%,36%)] dark:from-[hsl(223,47%,10%)] dark:to-[hsl(223,47%,10%)] lg:flex">
      <Link href="/dashboard" className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-6 transition-opacity hover:opacity-80">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/20 p-1.5 dark:bg-primary">
            <Music className="h-5 w-5 text-white dark:text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-white dark:text-sidebar-foreground">ArtistLog</span>
        </div>
        <NotificationCenter />
      </Link>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => router.prefetch(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/20 text-white dark:bg-primary dark:text-primary-foreground"
                    : "text-white/70 hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/20 dark:bg-border" />
      <div className="flex flex-col gap-2 p-4">
        {user && (
          <div className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 dark:bg-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white dark:bg-primary dark:text-primary-foreground">
              {(user.email?.charAt(0) || "U").toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white dark:text-foreground">{user.email || "usuario@artistlog"}</p>
              <p className="text-xs text-white/60 capitalize dark:text-muted-foreground">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Configuracoes
          </Link>
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          className="justify-start gap-3 text-white/70 hover:bg-white/10 hover:text-white dark:text-muted-foreground dark:hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
