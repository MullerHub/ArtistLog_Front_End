"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import useSWR from "swr"
import { Loader2, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArtistCard } from "@/components/artist-card"
import { ArtistFilters } from "@/components/artist-filters"
import { artistsService } from "@/lib/services/artists.service"
import { useDebounce } from "@/hooks/use-debounce"
import { calculateDistance } from "@/lib/geo"
import type { ArtistFilters as ArtistFilterParams, ArtistListResponse, GeoPoint } from "@/lib/types"

export default function ArtistsPage() {
  const [search, setSearch] = useState("")
  const [genreSearch, setGenreSearch] = useState("")
  const [eventTypeSearch, setEventTypeSearch] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [offset, setOffset] = useState(0)
  const [radiusKm, setRadiusKm] = useState(25)
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const limit = 20

  const debouncedSearch = useDebounce(search, 300)
  const debouncedGenreSearch = useDebounce(genreSearch, 300)
  const debouncedEventTypeSearch = useDebounce(eventTypeSearch, 300)
  const searchQuery = debouncedSearch.trim()
  const genreQuery = debouncedGenreSearch.trim()
  const eventTypeQuery = debouncedEventTypeSearch.trim()

  const filters: ArtistFilterParams = {
    q: searchQuery.length > 0 ? searchQuery : undefined,
    available: availableOnly || undefined,
    tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
    genres: genreQuery.length > 0 ? genreQuery : undefined,
    event_types: eventTypeQuery.length > 0 ? eventTypeQuery : undefined,
    limit,
    offset,
  }

  const filterKey = JSON.stringify(filters)

  const { data, isLoading, error } = useSWR<ArtistListResponse>(
    ["artists", filterKey],
    () => artistsService.getAll(filters),
    { revalidateOnFocus: false }
  )

  const isGeoFilterActive = !!userLocation && radiusKm > 0
  const shouldFetchAll = searchQuery.length > 0 && !isGeoFilterActive

  const { data: allArtistsData, isLoading: isAllArtistsLoading } = useSWR<ArtistListResponse>(
    shouldFetchAll ? ["artists-all"] : null,
    () => artistsService.getAll({ limit: 500, offset: 0 }),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    setOffset(0)
  }, [debouncedSearch, debouncedGenreSearch, debouncedEventTypeSearch, availableOnly, selectedTags])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearch("")
    setGenreSearch("")
    setEventTypeSearch("")
    setAvailableOnly(false)
    setSelectedTags([])
    setOffset(0)
  }, [])

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

  const artists = shouldFetchAll ? allArtistsData?.items || [] : data?.items || []

  const filteredArtists = useMemo(() => {
    let list = artists

    const getArtistGenres = (artist: ArtistListResponse["items"][number]) => {
      const merged =
        artist.genres && artist.genres.length > 0
          ? artist.genres
          : artist.event_types && artist.event_types.length > 0
            ? artist.event_types
            : artist.tags || []

      return merged.map((item) => item.toLowerCase().trim())
    }

    if (searchQuery.length > 0) {
      const normalizedSearch = searchQuery.toLowerCase()
      list = list.filter((artist) =>
        (artist.stage_name || "").toLowerCase().includes(normalizedSearch)
      )
    }

    if (availableOnly) {
      list = list.filter((artist) => artist.is_available)
    }

    if (selectedTags.length > 0) {
      const selected = selectedTags.map((tag) => tag.toLowerCase())
      list = list.filter((artist) =>
        getArtistGenres(artist).some((tag) => selected.includes(tag))
      )
    }

    if (genreQuery.length > 0) {
      const terms = genreQuery
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)

      list = list.filter((artist) => {
        const artistGenres = getArtistGenres(artist)
        if (artistGenres.length === 0) return false
        if (terms.length === 0) {
          const fallbackQuery = genreQuery.toLowerCase()
          return artistGenres.some((genre) => genre.includes(fallbackQuery))
        }
        return terms.every((term) => artistGenres.some((genre) => genre.includes(term)))
      })
    }

    if (eventTypeQuery.length > 0) {
      const terms = eventTypeQuery
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)

      list = list.filter((artist) => {
        const artistGenres = getArtistGenres(artist)
        if (artistGenres.length === 0) return false
        if (terms.length === 0) {
          const fallbackQuery = eventTypeQuery.toLowerCase()
          return artistGenres.some((genre) => genre.includes(fallbackQuery))
        }
        return terms.every((term) => artistGenres.some((genre) => genre.includes(term)))
      })
    }

    if (!isGeoFilterActive) return list

    return list.filter((artist) => {
      const point = artist.current_location || artist.base_location
      if (!point) return false
      return calculateDistance(userLocation as GeoPoint, point) <= radiusKm
    })
  }, [artists, availableOnly, eventTypeQuery, genreQuery, isGeoFilterActive, radiusKm, searchQuery, selectedTags, userLocation])

  const hasClientFilters = searchQuery.length > 0 || genreQuery.length > 0 || eventTypeQuery.length > 0 || availableOnly || selectedTags.length > 0 || isGeoFilterActive
  const total = hasClientFilters ? filteredArtists.length : data?.total || 0
  const hasMore = !hasClientFilters && offset + limit < (data?.total || 0)
  const isFallbackLoading = shouldFetchAll && isAllArtistsLoading

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Artistas</h1>
        <p className="text-sm text-muted-foreground">
          Encontre artistas disponiveis para seu evento
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-72 lg:flex-shrink-0">
          <ArtistFilters
            search={search}
            onSearchChange={setSearch}
            genreSearch={genreSearch}
            onGenreSearchChange={setGenreSearch}
            eventTypeSearch={eventTypeSearch}
            onEventTypeSearchChange={setEventTypeSearch}
            availableOnly={availableOnly}
            onAvailableChange={setAvailableOnly}
            selectedTags={selectedTags}
            onTagToggle={toggleTag}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="flex-1">
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Filtro por raio</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="artist-radius">Raio (km)</Label>
                <Input
                  id="artist-radius"
                  type="number"
                  min={1}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value) || 0)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleUseLocation} disabled={isLocating} aria-label="Usar minha localização atual para filtrar artistas">
                  {isLocating ? "Localizando..." : "Usar minha localizacao"}
                </Button>
                {userLocation && (
                  <Button type="button" variant="ghost" onClick={handleClearLocation} aria-label="Limpar filtro de localização">
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

          {(isLoading || isFallbackLoading) && offset === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <p className="text-sm text-destructive">Erro ao carregar artistas</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhum artista encontrado</p>
              <Button variant="outline" size="sm" onClick={clearFilters} aria-label="Limpar todos os filtros">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                {total} artista{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} userLocation={userLocation} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setOffset((prev) => prev + limit)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Carregar mais
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
