"use client"

import { use, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  MapPin,
  Music,
  Calendar,
  Loader2,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ContractProposalForm } from "@/components/contract-proposal-form"
import { useAuth } from "@/lib/auth-context"
import { artistsService } from "@/lib/services/artists.service"
import { schedulesService } from "@/lib/services/schedules.service"
import { formatCurrency, formatRating, formatDayOfWeek, formatDate } from "@/lib/formatters"
import { getCityFromCoordinates } from "@/lib/city-api"
import type { ArtistResponse, GeoPoint, ScheduleResponse } from "@/lib/types"

export default function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()

  const { data: artist, isLoading, error } = useSWR<ArtistResponse>(
    ["artist", id],
    () => artistsService.getById(id)
  )

  const [baseCity, setBaseCity] = useState<string | null>(null)
  const [currentCity, setCurrentCity] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const hasCurrentLocation = useMemo(() => {
    return !!(
      artist?.current_location &&
      (artist.current_location.latitude !== 0 || artist.current_location.longitude !== 0)
    )
  }, [artist?.current_location])

  const isVenue = user?.role === "VENUE"

  useEffect(() => {
    let isMounted = true

    async function fetchLocations() {
      if (!artist?.base_location && !artist?.current_location) return
      setIsLocating(true)

      const [base, current] = await Promise.all([
        artist?.base_location
          ? getCityFromCoordinates(artist.base_location)
          : Promise.resolve(null),
        hasCurrentLocation && artist?.current_location
          ? getCityFromCoordinates(artist.current_location)
          : Promise.resolve(null),
      ])

      if (!isMounted) return

      setBaseCity(base)
      setCurrentCity(current)
      setIsLocating(false)
    }

    fetchLocations()

    return () => {
      isMounted = false
    }
  }, [artist?.base_location, artist?.current_location, hasCurrentLocation])

  const formatCoords = (point?: GeoPoint | null) => {
    if (!point || point.latitude === undefined || point.latitude === null) return "Nao informada"
    return `${point.latitude.toFixed(2)}, ${point.longitude.toFixed(2)}`
  }

  const baseLabel = useMemo(() => {
    if (baseCity) return baseCity
    if (isLocating) return "Localizando..."
    return formatCoords(artist?.base_location)
  }, [baseCity, isLocating, artist?.base_location])

  const currentLabel = useMemo(() => {
    if (currentCity) return currentCity
    if (!hasCurrentLocation) return "Nao informada"
    if (isLocating) return "Localizando..."
    return formatCoords(artist?.current_location)
  }, [currentCity, hasCurrentLocation, isLocating, artist?.current_location])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-destructive">Artista nao encontrado</p>
        <Link href="/artists">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/artists" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" aria-label="Voltar para lista de artistas">
        <ArrowLeft className="h-4 w-4" />
        Voltar para artistas
      </Link>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:gap-6">
            {artist.photo_urls && artist.photo_urls.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.photo_urls[0]}
                alt={artist.stage_name}
                className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Music className="h-12 w-12 text-primary" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{artist.stage_name}</h1>
                <Badge
                  variant={artist.is_available ? "default" : "secondary"}
                  className={artist.is_available ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : ""}
                >
                  {artist.is_available ? "Disponivel" : "Indisponivel"}
                </Badge>
              </div>

              {artist.bio && (
                <p className="leading-relaxed text-muted-foreground">{artist.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <DollarSign className="h-4 w-4 text-[hsl(var(--success))]" />
                  {formatCurrency(artist.cache_base ?? 0)}
                </span>
                {artist.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                    {formatRating(artist.rating)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  Membro desde {formatDate(artist.created_at)}
                </span>
              </div>

              {artist.tags && artist.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artist.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Base: {baseLabel}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Atual: {currentLabel}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Contract Proposal Form - Only for Venues */}
        {isVenue && user && (
          <ContractProposalForm
            artistId={id}
            artistName={artist.stage_name}
            venueId={user.id}
            mode="venue-to-artist"
          />
        )}
        {/* Schedule Preview */}
        <ArtistSchedulePreview artistId={id} />
      </div>
    </div>
  )
}

function ArtistSchedulePreview({ artistId }: { artistId: string }) {
  const { data: schedule, isLoading } = useSWR<ScheduleResponse>(
    ["artist-schedule-preview", artistId],
    async () => {
      try {
        return await schedulesService.getScheduleById(artistId)
      } catch {
        return null as unknown as ScheduleResponse
      }
    },
    { revalidateOnFocus: false }
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!schedule || !schedule.slots || schedule.slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum horario disponivel cadastrado.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Horarios Disponiveis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {schedule.slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {formatDayOfWeek(slot.day_of_week)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm text-muted-foreground">
                  {slot.start_time} - {slot.end_time}
                </span>
                {slot.crosses_midnight && (
                  <span className="text-xs font-semibold text-amber-600">próx. dia</span>
                )}
              </div>
              <Badge
                variant={slot.is_booked ? "secondary" : "outline"}
                className={!slot.is_booked ? "border-[hsl(var(--success))] text-[hsl(var(--success))]" : ""}
              >
                {slot.is_booked ? "Reservado" : "Disponivel"}
              </Badge>
            </div>
          ))}
        </div>
        {schedule.notes && (
          <>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              <strong>Notas:</strong> {schedule.notes}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
