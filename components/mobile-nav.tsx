"use client"

import React from "react"

import { useState } from "react"
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
  Menu,
  X,
  Settings,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { NotificationCenter } from "@/components/notification-center"

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  )

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex h-14 items-center gap-2 border-b border-border px-6 transition-opacity hover:opacity-80">
            <div className="rounded-lg bg-primary p-1.5">
              <Music className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">ArtistLog</span>
          </Link>
          <nav className="flex flex-col gap-1 p-3">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
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
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Configuracoes
            </Link>
            <Button
              variant="ghost"
              className="justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={() => {
                setOpen(false)
                logout()
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <div className="rounded-lg bg-primary p-1.5">
          <Music className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground">ArtistLog</span>
      </Link>
      <NotificationCenter />    </header>
  )
}
