"use client"

import React from "react"

import Link from "next/link"
import {
  Calendar,
  Mic,
  Building2,
  Star,
  Settings,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === "ARTIST") {
    return <ArtistDashboard email={user.email} />
  }

  if (user?.role === "VENUE") {
    return <VenueDashboard email={user.email} />
  }

  return null
}

function ArtistDashboard({ email }: { email: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo de volta!
        </h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="Horarios Disponiveis"
          value="--"
          description="Na sua agenda"
          color="primary"
        />
        <StatCard
          icon={Star}
          label="Avaliacao Media"
          value="--"
          description="Baseado em reviews"
          color="warning"
        />
        <StatCard
          icon={TrendingUp}
          label="Visualizacoes"
          value="--"
          description="Do seu perfil"
          color="accent"
        />
        <StatCard
          icon={Music}
          label="Shows Realizados"
          value="--"
          description="Total ate agora"
          color="secondary"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Acoes Rapidas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            icon={Calendar}
            title="Gerenciar Agenda"
            description="Adicione ou remova horarios disponiveis"
            href="/schedule"
            color="primary"
          />
          <QuickActionCard
            icon={Building2}
            title="Buscar Locais"
            description="Encontre casas de show na sua regiao"
            href="/venues"
            color="secondary"
          />
          <QuickActionCard
            icon={Settings}
            title="Editar Perfil"
            description="Atualize suas informacoes profissionais"
            href="/settings"
            color="accent"
          />
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Suas atividades recentes aparecerrao aqui conforme voce usa a plataforma. Comece criando sua agenda e explorando venues disponiveis.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function VenueDashboard({ email }: { email: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo de volta!
        </h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Artistas Disponiveis"
          value="--"
          description="Na plataforma"
          color="primary"
        />
        <StatCard
          icon={Star}
          label="Avaliacao da Venue"
          value="--"
          description="Baseado em reviews"
          color="warning"
        />
        <StatCard
          icon={Calendar}
          label="Eventos Realizados"
          value="--"
          description="Total ate agora"
          color="accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Artistas Contratados"
          value="--"
          description="Diferentes artistas"
          color="secondary"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Acoes Rapidas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            icon={Mic}
            title="Buscar Artistas"
            description="Encontre artistas disponiveis para seu evento"
            href="/artists"
            color="primary"
          />
          <QuickActionCard
            icon={Star}
            title="Avaliar Artista"
            description="Avalie artistas apos shows realizados"
            href="/reviews"
            color="warning"
          />
          <QuickActionCard
            icon={Settings}
            title="Editar Perfil"
            description="Atualize as informacoes da sua venue"
            href="/settings"
            color="accent"
          />
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Suas atividades recentes aparecerrao aqui conforme voce usa a plataforma. Comece buscando artistas disponiveis para seus eventos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  description: string
  color: "primary" | "secondary" | "accent" | "warning"
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/20",
    accent: "text-accent bg-accent/20",
    warning: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10",
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
  color: "primary" | "secondary" | "accent" | "warning"
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/20",
    accent: "text-accent bg-accent/20",
    warning: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10",
  }

  return (
    <Link href={href}>
      <Card className="h-full cursor-pointer transition-all hover:border-primary hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className={`w-fit rounded-lg p-2.5 ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
            Acessar <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
