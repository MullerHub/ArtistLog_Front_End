"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Music,
  LayoutDashboard,
  Mic,
  Building2,
  Calendar,
  Star,
  LogOut,
  Settings,
  FileText,
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
  { label: "Venues", href: "/venues", icon: Building2 },
  { label: "Agenda", href: "/schedule", icon: Calendar, roles: ["ARTIST"] },
  { label: "Contratos", href: "/contracts", icon: FileText },
  { label: "Avaliacoes", href: "/reviews", icon: Star },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  )

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <Link href="/dashboard" className="flex h-16 items-center justify-between gap-2 border-b border-border px-6 transition-opacity hover:opacity-80">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ArtistLog</span>
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
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="flex flex-col gap-2 p-4">
        {user && (
          <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Configuracoes
          </Link>
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          className="justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
