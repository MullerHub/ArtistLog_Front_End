"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import useSWR from "swr"
import { Loader2, Building2, Search, MapPin, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VenueCard } from "@/components/venue-card"
import { useAuth } from "@/lib/auth-context"
import { venuesService } from "@/lib/services/venues.service"
import { useDebounce } from "@/hooks/use-debounce"
import { CommunityVenueForm } from "@/components/community-venue-form"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import type { GeoPoint, NearbyVenueResponse, VenueFilters, VenueListResponse, VenueResponse } from "@/lib/types"

export default function VenuesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [offset, setOffset] = useState(0)
  const [radiusKm, setRadiusKm] = useState(25)
  const [originFilter, setOriginFilter] = useState<string>("ALL")
  const [cityFilter, setCityFilter] = useState("")
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const limit = 20

  // Apenas Artists podem usar filtro de geolocalização
  const isArtist = user?.role === "ARTIST"
  const isVenue = user?.role === "VENUE"

  const debouncedSearch = useDebounce(search, 300)
  const debouncedCity = useDebounce(cityFilter, 300)
  const searchQuery = debouncedSearch.trim()
  const cityQuery = debouncedCity.trim()
  const isSearchActive = searchQuery.length > 0

  const filters: VenueFilters = {
    q: isSearchActive ? searchQuery : undefined,
    city: cityQuery.length > 0 ? cityQuery : undefined,
    origin: originFilter !== "ALL" ? originFilter : undefined,
    limit,
    offset,
  }

  const filterKey = JSON.stringify(filters)

  const { data, isLoading, error } = useSWR<VenueListResponse>(
    ["venues", filterKey],
    () => venuesService.getAll(filters),
    { revalidateOnFocus: false }
  )

  const { data: nearbyData, isLoading: isNearbyLoading, error: nearbyError } = useSWR(
    userLocation ? ["venues-nearby", userLocation.latitude, userLocation.longitude, radiusKm] : null,
    () => venuesService.getNearby({
      latitude: userLocation?.latitude || 0,
      longitude: userLocation?.longitude || 0,
      radius: radiusKm,
    }),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    setOffset(0)
  }, [debouncedSearch, debouncedCity, originFilter])

  const mapNearbyToVenue = useCallback((venue: NearbyVenueResponse): VenueResponse => {
    return {
      id: venue.venue_id,
      venue_name: venue.venue_name,
      city: venue.city,
      state: venue.state,
      description: venue.description || "",
      capacity: venue.capacity,
      infrastructure: venue.infrastructure || "",
      venue_photos: venue.venue_photos || [],
      profile_photo: venue.profile_photo || undefined,
      hours: venue.hours || undefined,
      phone: venue.phone || undefined,
      website: venue.website || undefined,
      rating: venue.average_rating || 0,
      reviews_count: venue.total_reviews || 0,
      base_location: venue.location || null,
      origin: venue.origin,
      is_community: venue.origin === "COMMUNITY",
      is_anonymous: venue.is_anonymous,
      created_by_user_id: venue.created_by_user_id || undefined,
      created_at: venue.created_at,
      updated_at: venue.updated_at,
    }
  }, [])

  const isGeoFilterActive = !!userLocation && radiusKm > 0
  const shouldFetchAll = isSearchActive && !isGeoFilterActive

  const { data: allVenuesData, isLoading: isAllVenuesLoading } = useSWR<VenueListResponse>(
    shouldFetchAll ? ["venues-all"] : null,
    () => venuesService.getAll({ limit: 500, offset: 0 }),
    { revalidateOnFocus: false }
  )

  const venues = useMemo(() => {
    if (isGeoFilterActive) {
      let mapped = (nearbyData || []).map(mapNearbyToVenue)
      
      // Aplicar filtro de cidade se ativo
      if (cityQuery) {
        mapped = mapped.filter((venue) => 
          venue.city.toLowerCase().includes(cityQuery.toLowerCase())
        )
      }
      
      // Aplicar filtro de busca por nome se ativo
      if (isSearchActive) {
        mapped = mapped.filter((venue) => 
          venue.venue_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      return mapped
    }

    if (isSearchActive) {
      const serverItems = data?.items || []
      if (serverItems.length > 0) return serverItems
      const fallbackItems = allVenuesData?.items || []
      return fallbackItems.filter((venue) => venue.venue_name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return data?.items || []
  }, [allVenuesData?.items, data?.items, isGeoFilterActive, isSearchActive, mapNearbyToVenue, nearbyData, searchQuery, cityQuery])

  const total = isGeoFilterActive || isSearchActive ? venues.length : data?.total || 0
  const hasMore = !isGeoFilterActive && !isSearchActive && offset + limit < (data?.total || 0)
  const isFallbackLoading = isSearchActive && !isGeoFilterActive && !data?.items?.length && isAllVenuesLoading

  const handleUseLocation = () => {
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError("Geolocalizacao nao suportada neste navegador")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setIsLocating(false)
      },
      () => {
        setLocationError("Nao foi possivel obter sua localizacao")
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleClearLocation = () => {
    setUserLocation(null)
    setLocationError(null)
  }

  const handleCommunityVenueSuccess = () => {
    setIsDialogOpen(false)
    router.push("/venues/community?created=1")
  }

  const handleClaimVenue = () => {
    router.push("/venues/claim")
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Casas de Show</h1>
          <p className="text-sm text-muted-foreground">
            Encontre casas de show e espaços para eventos
          </p>
        </div>

        <div className="flex gap-2">
          {isArtist && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Sugerir Casa de Show
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <CommunityVenueForm
                  onSuccess={handleCommunityVenueSuccess}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}

          {isVenue && (
            <Button size="sm" variant="outline" onClick={handleClaimVenue}>
              <Building2 className="mr-2 h-4 w-4" />
              Reivindicar Minha Casa de Show
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar Locais..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search.length > 0 && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="w-full sm:w-48">
            <Input
              placeholder="Filtrar por cidade..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="OWNER">Verificadas</SelectItem>
                <SelectItem value="COMMUNITY">Comunitárias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isSearchActive && (
          <p className="text-xs text-muted-foreground">
            Mostrando resultados para <span className="font-semibold text-foreground">"{searchQuery}"</span>
          </p>
        )}
        
        {cityQuery.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Filtrando por cidade: <span className="font-semibold text-foreground">{cityQuery}</span>
            <button
              type="button"
              onClick={() => setCityFilter("")}
              className="ml-2 text-primary hover:underline"
            >
              Limpar
            </button>
          </p>
        )}
      </div>

      {isArtist && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Filtro por raio</h3>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="venue-radius">Raio (km)</Label>
              <Input
                id="venue-radius"
                type="number"
                min={1}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleUseLocation} disabled={isLocating}>
                {isLocating ? "Localizando..." : "Usar minha localizacao"}
              </Button>
              {userLocation && (
                <Button type="button" variant="ghost" onClick={handleClearLocation}>
                  Limpar
                </Button>
              )}
            </div>
          </div>
          {locationError && (
            <p className="mt-2 text-sm text-destructive">{locationError}</p>
          )}
          {userLocation && (
            <p className="mt-2 text-xs text-muted-foreground">
              Filtro ativo: {radiusKm} km
            </p>
          )}
        </div>
      )}

      {((isGeoFilterActive && isNearbyLoading) || (!isGeoFilterActive && isLoading) || isFallbackLoading) && offset === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (isGeoFilterActive ? nearbyError : error) ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-sm text-destructive">Erro ao carregar casas de show</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Nenhuma casa de show encontrada</p>
          {isSearchActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              aria-label="Limpar busca e ver todos os locais"
            >
              Limpar busca
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {total} casa{total !== 1 ? "s" : ""} de show encontrada{total !== 1 ? "s" : ""}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues?.map((venue, index) => (
              <VenueCard
                key={venue.id || `venue-${index}`}
                venue={venue}
                userLocation={userLocation}
              />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setOffset((prev) => prev + limit)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
