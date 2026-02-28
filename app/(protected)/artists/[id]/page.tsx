"use client"

import { use, useCallback, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  MapPin,
  Music,
  Music2,
  Calendar,
  Loader2,
  DollarSign,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  User,
  Image,
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
import { API_BASE_URL } from "@/lib/api-client"
import type { ArtistResponse, GeoPoint, ScheduleResponse } from "@/lib/types"

export default function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()

  const { data: artist, isLoading, error, mutate } = useSWR<ArtistResponse>(
    ["artist", id],
    () => artistsService.getById(id),
    { revalidateOnFocus: true, revalidateIfStale: true }
  )

  // Revalidate when page becomes visible (user returns from settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        mutate(undefined, { revalidate: true })
      }
    }

    // Also revalidate on page focus
    const handleFocus = () => {
      mutate(undefined, { revalidate: true })
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [mutate])

  const [baseCity, setBaseCity] = useState<string | null>(null)
  const [currentCity, setCurrentCity] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const normalizePoint = useCallback((point?: GeoPoint | null) => {
    if (!point) return null
    
    // Handle both lowercase (latitude/longitude) and uppercase (Latitude/Longitude) from backend
    const latRaw = (point as any).latitude ?? (point as any).Latitude
    const lngRaw = (point as any).longitude ?? (point as any).Longitude
    const latitude = typeof latRaw === "string" ? Number(latRaw) : latRaw
    const longitude = typeof lngRaw === "string" ? Number(lngRaw) : lngRaw

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    if (latitude === 0 && longitude === 0) return null

    return { latitude: latitude as number, longitude: longitude as number }
  }, [])

  const hasValidPoint = useCallback(
    (point?: GeoPoint | null) => !!normalizePoint(point),
    [normalizePoint]
  )

  const hasCurrentLocation = useMemo(() => {
    return hasValidPoint(artist?.current_location)
  }, [artist?.current_location, hasValidPoint])

  const hasBaseLocation = useMemo(() => {
    return hasValidPoint(artist?.base_location)
  }, [artist?.base_location, hasValidPoint])

  const isVenue = user?.role === "VENUE"

  const resolvePhotoUrl = useCallback((photoUrl?: string | null) => {
    if (!photoUrl) return null
    return photoUrl.startsWith("http") ? photoUrl : `${API_BASE_URL}${photoUrl}`
  }, [])

  const resolveWebsiteUrl = useCallback((url?: string | null) => {
    if (!url) return null
    if (/^https?:\/\//i.test(url)) return url
    return `https://${url}`
  }, [])

  const baseFallbackCity = useMemo(() => {
    if (!artist) return null
    const city = (artist as { city?: string }).city
    const state = (artist as { state?: string }).state
    if (!city) return null
    return state ? `${city} - ${state}` : city
  }, [artist])

  const formatCoords = useCallback(
    (point?: GeoPoint | null) => {
      const normalized = normalizePoint(point)
      if (!normalized) return "Nao informada"
      return `${normalized.latitude.toFixed(2)}, ${normalized.longitude.toFixed(2)}`
    },
    [normalizePoint]
  )

  useEffect(() => {
    let isMounted = true

    async function fetchLocations() {
      if (!hasBaseLocation && !hasCurrentLocation) return
      setIsLocating(true)

      const normalizedBase = normalizePoint(artist?.base_location)
      const normalizedCurrent = normalizePoint(artist?.current_location)

      const [base, current] = await Promise.all([
        normalizedBase ? getCityFromCoordinates(normalizedBase) : Promise.resolve(null),
        normalizedCurrent ? getCityFromCoordinates(normalizedCurrent) : Promise.resolve(null),
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
  }, [artist?.base_location, artist?.current_location, hasBaseLocation, hasCurrentLocation, normalizePoint])

  const baseLabel = useMemo(() => {
    if (baseCity) return baseCity
    if (baseFallbackCity) return baseFallbackCity
    if (isLocating) return "Localizando..."
    return formatCoords(artist?.base_location)
  }, [baseCity, baseFallbackCity, formatCoords, isLocating, artist?.base_location])

  const currentLabel = useMemo(() => {
    if (currentCity) return currentCity
    if (isLocating) return "Localizando..."
    const formatted = formatCoords(artist?.current_location)
    return formatted
  }, [currentCity, formatCoords, isLocating, artist?.current_location])

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

  const artistGenres =
    artist.genres && artist.genres.length > 0
      ? artist.genres
      : artist.event_types && artist.event_types.length > 0
        ? artist.event_types
        : artist.tags || []

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
            {artist.profile_photo || (artist.photo_urls && artist.photo_urls.length > 0) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvePhotoUrl(artist.profile_photo || artist.photo_urls?.[0]) || ""}
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

              {artistGenres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artistGenres.map((tag) => (
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

        {/* About / Bio Section */}
        {artist.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Sobre o Artista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {artist.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Photo Gallery */}
        {artist.photo_urls && artist.photo_urls.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-5 w-5 text-primary" />
                Fotos ({artist.photo_urls.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {artist.photo_urls.map((photo, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    src={resolvePhotoUrl(photo) || ""}
                    alt={`${artist.stage_name} - Foto ${index + 1}`}
                    className="aspect-square w-full rounded-lg object-cover transition-transform hover:scale-105"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {(artist.email || artist.phone || artist.whatsapp || artist.website || (artist.soundcloud_links && artist.soundcloud_links.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {artist.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <a
                      href={`mailto:${artist.email}`}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {artist.email}
                    </a>
                  </div>
                </div>
              )}
              {artist.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Telefone</span>
                    <a
                      href={`tel:${artist.phone}`}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {artist.phone}
                    </a>
                  </div>
                </div>
              )}
              {artist.whatsapp && (
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">WhatsApp</span>
                    <a
                      href={`https://wa.me/${artist.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {artist.whatsapp}
                    </a>
                  </div>
                </div>
              )}
              {artist.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Website</span>
                    <a
                      href={resolveWebsiteUrl(artist.website) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {artist.website}
                    </a>
                  </div>
                </div>
              )}
              {artist.soundcloud_links && artist.soundcloud_links.length > 0 && (
                <div className="flex items-start gap-3">
                  <Music2 className="mt-1 h-5 w-5 text-primary" />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">SoundCloud</span>
                    {artist.soundcloud_links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
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

  const slotsByDay = (schedule?.slots || []).reduce(
    (acc, slot) => {
      const day = slot.day_of_week
      if (!acc[day]) acc[day] = []
      acc[day].push(slot)
      return acc
    },
    {} as Record<number, ScheduleResponse["slots"]>
  )

  const weekdayOrder = [0, 1, 2, 3, 4, 5, 6]

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
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">Duração mínima: {schedule.min_gig_duration} min</Badge>
          {schedule.preferred_event_types?.map((eventType) => (
            <Badge key={eventType} variant="outline">{eventType}</Badge>
          ))}
        </div>



        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {weekdayOrder.map((day) => {
            const slots = slotsByDay[day] || []
            return (
              <div key={day} className="rounded-lg border border-border bg-card p-2">
                <p className="text-[11px] font-semibold text-foreground">{formatDayOfWeek(day)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {slots.length} slot{slots.length !== 1 ? "s" : ""}
                </p>
              </div>
            )
          })}
        </div>

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
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                    🌙 madrugada
                  </span>
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
