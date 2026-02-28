"use client"

import Link from "next/link"
import { Star, Building2, Users, MessageSquare, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GeoPoint, VenueResponse } from "@/lib/types"
import { formatRating } from "@/lib/formatters"
import { calculateDistance, formatDistance } from "@/lib/geo"
import { getCityFromCoordinates } from "@/lib/city-api"
import { useEffect, useMemo, useState } from "react"
import { CommunityVenueBadge } from "@/components/community-venue-badge"

interface VenueCardProps {
  venue: VenueResponse
  userLocation?: GeoPoint | null
  distanceKm?: number
}

export function VenueCard({ venue, userLocation = null, distanceKm }: VenueCardProps) {
  const [baseCity, setBaseCity] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasPhoto = venue.venue_photos && venue.venue_photos.length > 0
  // Use profile_photo se disponível, senão primeira foto
  const photoUrl = venue.profile_photo || (hasPhoto ? venue.venue_photos?.[0] : null)

  const baseLocation = venue.base_location || null

  useEffect(() => {
    let isMounted = true

    async function fetchCity() {
      if (!baseLocation) return
      setIsLoading(true)
      const city = await getCityFromCoordinates(baseLocation)
      if (!isMounted) return
      setBaseCity(city)
      setIsLoading(false)
    }

    fetchCity()

    return () => {
      isMounted = false
    }
  }, [baseLocation])

  const computedDistance = useMemo(() => {
    if (distanceKm !== undefined) return distanceKm
    if (!userLocation || !baseLocation) return null
    return calculateDistance(userLocation, baseLocation)
  }, [baseLocation, distanceKm, userLocation])

  const baseLabel = useMemo(() => {
    // Priorizar a cidade direta do venue
    if (venue.city) return venue.city
    if (!baseLocation) return "Localização não informada"
    if (baseCity) return baseCity
    if (isLoading) return "Localizando..."
    return `${baseLocation.latitude.toFixed(2)}, ${baseLocation.longitude.toFixed(2)}`
  }, [baseCity, baseLocation, isLoading, venue.city])

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={venue.venue_name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
              <Building2 className="h-6 w-6 text-secondary" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{venue.venue_name}</h3>
              {venue.is_community && <CommunityVenueBadge />}
            </div>
            {venue.infrastructure && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {venue.infrastructure}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {venue.capacity} pessoas
          </span>
          {venue.rating > 0 && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
              {formatRating(venue.rating)}
            </span>
          )}
          {venue.reviews_count > 0 && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {venue.reviews_count}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Base: {baseLabel}
          </span>
          {computedDistance !== null && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Distancia: {formatDistance(computedDistance)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-border px-5 py-3">
        <Link href={`/venues/${venue.id}`} className="w-full">
          <Button variant="outline" className="w-full bg-transparent" size="sm" aria-label={`Ver detalhes do local ${venue.venue_name}`}>
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
