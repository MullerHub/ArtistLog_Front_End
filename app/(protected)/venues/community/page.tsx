"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { venuesService } from "@/lib/services/venues.service"

interface CommunityVenueItem {
  id: string
  venue_name: string
  description: string
  infrastructure: string
  capacity: number
  city: string
  state: string
  status: string
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export default function CommunityVenuesPage() {
  const searchParams = useSearchParams()
  const created = searchParams.get("created") === "1"

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const searchQuery = debouncedSearch.trim()

  const { data, isLoading, error } = useSWR<CommunityVenueItem[]>(
    ["community-venues", searchQuery],
    () =>
      venuesService.getCommunityVenues({
        q: searchQuery || undefined,
        status: "ACTIVE",
        limit: 100,
        offset: 0,
      }),
    { revalidateOnFocus: false }
  )

  const venues = useMemo(() => data || [], [data])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/venues"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para venues
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Casas de Show Comunitarias</h1>
        <p className="text-sm text-muted-foreground">
          Veja as sugestoes criadas pela comunidade e acompanhe o status.
        </p>
      </div>

      {created && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          ✅ Casa de show comunitaria criada. Ela aparece aqui enquanto estiver ativa.
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou descricao..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Erro ao carregar community venues.
        </div>
      )}

      {!isLoading && !error && venues.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma casa de show comunitaria encontrada com esse termo.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {venues.map((venue) => (
          <Card key={venue.id}>
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span>{venue.venue_name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {venue.city} - {venue.state} • Capacidade {venue.capacity}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {venue.description && (
                <p className="text-muted-foreground">{venue.description}</p>
              )}
              {venue.infrastructure && (
                <p className="text-muted-foreground">Infraestrutura: {venue.infrastructure}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Status: {venue.status}</span>
                <span>Criado em: {new Date(venue.created_at).toLocaleDateString("pt-BR")}</span>
                {venue.is_anonymous && <span>Anonimo</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Link href="/venues">
          <Button variant="outline" size="sm">
            Voltar
          </Button>
        </Link>
      </div>
    </div>
  )
}
