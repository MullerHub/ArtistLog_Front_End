"use client"

import Link from "next/link"
import { Star, MapPin, Music } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ArtistResponse, GeoPoint } from "@/lib/types"
import { formatCurrency, formatRating } from "@/lib/formatters"
import { calculateDistance, formatDistance } from "@/lib/geo"
import { getCityFromCoordinates } from "@/lib/city-api"
import { useEffect, useState, useMemo } from "react"

interface LocationInfoProps {
  artist: ArtistResponse
  userLocation: GeoPoint | null
}

function LocationInfo({ artist, userLocation }: LocationInfoProps) {
  const [baseCity, setBaseCity] = useState<string | null>(null)
  const [currentCity, setCurrentCity] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const hasCurrentLocation = useMemo(
    () =>
      artist.current_location &&
      (artist.current_location.latitude !== 0 ||
        artist.current_location.longitude !== 0),
    [artist.current_location]
  )

  const baseLocation = artist.base_location || null
  const currentLocation = hasCurrentLocation ? artist.current_location || null : null

  useEffect(() => {
    let isMounted = true

    async function fetchLocations() {
      if (!baseLocation && !currentLocation) {
        return
      }

      setIsLoading(true)

      const [base, current] = await Promise.all([
        baseLocation ? getCityFromCoordinates(baseLocation) : Promise.resolve(null),
        currentLocation ? getCityFromCoordinates(currentLocation) : Promise.resolve(null),
      ])

      if (!isMounted) return

      setBaseCity(base)
      setCurrentCity(current)
      setIsLoading(false)
    }

    fetchLocations()

    return () => {
      isMounted = false
    }
  }, [baseLocation, currentLocation])

  const distanceText = useMemo(() => {
    if (!userLocation) return null
    const distancePoint = currentLocation || baseLocation
    if (!distancePoint) return null
    return formatDistance(calculateDistance(userLocation, distancePoint))
  }, [baseLocation, currentLocation, userLocation])

  const formatPoint = (point: GeoPoint | null, city: string | null) => {
    if (!point) return "Nao informada"
    if (city) return city
    if (isLoading) return "Localizando..."
    return `${point.latitude.toFixed(2)}, ${point.longitude.toFixed(2)}`
  }

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        Base: {formatPoint(baseLocation, baseCity)}
      </span>
      <span className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        Atual: {formatPoint(currentLocation, currentCity)}
      </span>
      {distanceText && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Distancia: {distanceText}
        </span>
      )}
    </div>
  )
}

interface ArtistCardProps {
  artist: ArtistResponse
  userLocation?: GeoPoint | null
}

export function ArtistCard({ artist, userLocation = null }: ArtistCardProps) {
  const hasPhoto = artist.photo_urls && artist.photo_urls.length > 0

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {hasPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.photo_urls[0]}
                alt={artist.stage_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Music className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground">{artist.stage_name}</h3>
              <LocationInfo artist={artist} userLocation={userLocation} />
            </div>
          </div>
          <Badge
            variant={artist.is_available ? "default" : "secondary"}
            className={artist.is_available ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : ""}
          >
            {artist.is_available ? "Disponivel" : "Indisponivel"}
          </Badge>
        </div>

        {artist.bio && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {artist.bio}
          </p>
        )}

        {artist.tags && artist.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {artist.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {artist.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{artist.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(artist.cache_base ?? 0)}
          </span>
          {artist.rating > 0 && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
              {formatRating(artist.rating)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-border px-5 py-3">
        <Link href={`/artists/${artist.id}`} className="w-full">
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            Ver Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
