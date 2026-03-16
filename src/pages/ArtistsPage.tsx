import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { InternalHeader } from "@/components/InternalHeader";
import { ArtistCard } from "@/components/ArtistCard";
import { CitySearch } from "@/components/CitySearch";
import { artistsService } from "@/services/artists-service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Search, Music, MapPin, Locate, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";

const QUICK_TAGS = [
  "Open Format", "15 anos", "Balada", "Eletrônica", "House",
  "Techno", "Sertanejo", "Funk", "Pop", "Rock",
];

interface ArtistSearchFilters {
  search: string;
  city: string;
  only_available: boolean;
  tags: string[];
  radius_km: number;
  user_lat: number | null;
  user_lng: number | null;
}

const DEFAULT_FILTERS: ArtistSearchFilters = {
  search: "",
  city: "",
  only_available: false,
  tags: [],
  radius_km: 50,
  user_lat: null,
  user_lng: null,
};

const ITEMS_PER_PAGE = 6;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

// Haversine for mock distance filtering (uses city coords from mock data)
const CITY_COORDS: Record<string, [number, number]> = {
  "São Paulo": [-23.5505, -46.6333],
  "Rio de Janeiro": [-22.9068, -43.1729],
  "Belo Horizonte": [-19.9167, -43.9345],
  "Curitiba": [-25.4284, -49.2733],
  "Recife": [-8.0476, -34.877],
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ArtistsPage() {
  const [filters, setFilters] = useState<ArtistSearchFilters>(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [geoLoading, setGeoLoading] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["artists", "list"],
    queryFn: () => artistsService.list({ limit: 200, offset: 0 }),
  });

  const artists = data?.items || [];

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFilters((f) => ({
          ...f,
          user_lat: pos.coords.latitude,
          user_lng: pos.coords.longitude,
        }));
        setGeoLoading(false);
        toast.success("Localização obtida! Filtrando por proximidade.");
      },
      () => {
        setGeoLoading(false);
        toast.error("Não foi possível obter sua localização.");
      }
    );
  };

  const toggleTag = (tag: string) =>
    setFilters((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      // Text search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          a.stage_name.toLowerCase().includes(q) ||
          a.genres.some((g) => g.toLowerCase().includes(q)) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.city.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (filters.city && !a.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // Availability
      if (filters.only_available && !a.is_available) return false;

      // Quick tags — match against genres + tags
      if (filters.tags.length > 0) {
        const artistTags = [...a.genres, ...a.tags, ...a.event_types].map((t) => t.toLowerCase());
        const hasMatch = filters.tags.some((ft) => artistTags.some((at) => at.includes(ft.toLowerCase())));
        if (!hasMatch) return false;
      }

      // Radius filter
      if (filters.user_lat !== null && filters.user_lng !== null) {
        const coords = CITY_COORDS[a.city];
        if (coords) {
          const dist = haversineKm(filters.user_lat, filters.user_lng, coords[0], coords[1]);
          if (dist > filters.radius_km) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.user_lat !== null && filters.user_lng !== null) {
        const coordsA = CITY_COORDS[a.city];
        const coordsB = CITY_COORDS[b.city];
        if (coordsA && coordsB) {
          const distA = haversineKm(filters.user_lat, filters.user_lng, coordsA[0], coordsA[1]);
          const distB = haversineKm(filters.user_lat, filters.user_lng, coordsB[0], coordsB[1]);
          return distA - distB;
        }
      }
      return 0;
    });
  }, [artists, filters]);

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasLocation = filters.user_lat !== null;
  const activeFilterCount = [
    filters.city !== "",
    filters.only_available,
    filters.tags.length > 0,
    hasLocation,
  ].filter(Boolean).length;

  return (
    <>
      <InternalHeader title="Artistas" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-xl p-4">
              <h2 className="font-heading font-semibold text-foreground mb-1">Artistas</h2>
              <p className="text-sm text-muted-foreground">
                Encontre artistas disponíveis para seu evento
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="glass rounded-xl p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar artista, gênero, tag ou cidade..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="pl-9 bg-transparent border-0 focus-visible:ring-0"
                />
              </div>
            </div>
          </motion.div>

          {/* Filters — collapsible */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <div className="glass rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setFiltersExpanded((v) => !v)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h3 className="font-heading font-semibold text-sm text-foreground">Filtros</h3>
                  {activeFilterCount > 0 && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <motion.div animate={{ rotate: filtersExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </button>

              {filtersExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 space-y-4"
                >
                  {activeFilterCount > 0 && (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setFilters(DEFAULT_FILTERS); setVisibleCount(ITEMS_PER_PAGE); }} className="text-xs h-7">
                        <X className="h-3 w-3 mr-1" /> Limpar filtros
                      </Button>
                    </div>
                  )}

                  {/* Availability toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">Apenas disponíveis</p>
                      <p className="text-xs text-muted-foreground">Mostrar somente artistas com agenda aberta</p>
                    </div>
                    <Switch
                      checked={filters.only_available}
                      onCheckedChange={(v) => setFilters((f) => ({ ...f, only_available: v }))}
                    />
                  </div>

                  {/* Quick tags */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Tags rápidas</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TAGS.map((tag) => (
                        <Badge
                          key={tag}
                          variant={filters.tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* City filter */}
                  <div>
                    <CitySearch
                      compact
                      required={false}
                      label="Cidade"
                      value={filters.city}
                      onCitySelect={(city) => setFilters((f) => ({ ...f, city: city.name }))}
                      placeholder="Digite a cidade para buscar..."
                    />
                  </div>

                  {/* Radius section */}
                  <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="text-xs font-medium text-foreground">Filtro por raio</Label>
                    </div>

                    <Button
                      variant={hasLocation ? "default" : "outline"}
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleUseLocation}
                      disabled={geoLoading}
                    >
                      <Locate className={`h-3.5 w-3.5 mr-1.5 ${geoLoading ? "animate-spin" : ""}`} />
                      {geoLoading ? "Obtendo localização..." : hasLocation ? "📍 Localização ativa" : "Usar minha localização"}
                    </Button>

                    {/* Distance slider — always visible */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">
                          Raio: {filters.radius_km} km
                          {!hasLocation && " (ative a localização)"}
                        </Label>
                      </div>
                      <Slider
                        value={[filters.radius_km]}
                        onValueChange={([v]) => setFilters((f) => ({ ...f, radius_km: v }))}
                        min={5}
                        max={500}
                        step={5}
                        disabled={!hasLocation}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>5 km</span>
                        <span>500 km</span>
                      </div>
                      {hasLocation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => setFilters((f) => ({ ...f, user_lat: null, user_lng: null }))}
                        >
                          Remover localização
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} artista{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              {hasLocation && ` (dentro de ${filters.radius_km} km)`}
            </p>
            {(filters.city !== "" || filters.tags.length > 0 || filters.only_available || hasLocation) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => { setFilters(DEFAULT_FILTERS); setVisibleCount(ITEMS_PER_PAGE); }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">Carregando artistas...</p>
            </div>
          ) : isError ? (
            <div className="glass rounded-xl p-12 text-center">
              <h3 className="font-heading font-semibold text-foreground mb-1">Erro ao carregar artistas</h3>
              <p className="text-sm text-muted-foreground">Verifique a conexao com o backend.</p>
            </div>
          ) : displayed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map((artist, i) => (
                <motion.div key={artist.id} initial="hidden" animate="visible" custom={i + 3} variants={fadeUp}>
                  <ArtistCard artist={artist} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
              <div className="glass rounded-xl p-12 text-center">
                <Music className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-foreground mb-1">Nenhum artista encontrado</h3>
                <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou aumentar o raio de busca.</p>
              </div>
            </motion.div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}>
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
