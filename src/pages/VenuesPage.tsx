import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { InternalHeader } from "@/components/InternalHeader";
import { VenueCard } from "@/components/VenueCard";
import { CitySearch } from "@/components/CitySearch";
import { BRAZIL_STATES } from "@/lib/brazil-states";
import { venuesService } from "@/services/venues-service";
import type { VenueFilters } from "@/types/venue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Building2, MapPin, Locate, Navigation, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface VenueFiltersExtended extends VenueFilters {
  radius_km: number;
  user_lat: number | null;
  user_lng: number | null;
}

const DEFAULT_FILTERS: VenueFiltersExtended = {
  search: "",
  state: "",
  city: "",
  min_capacity: 0,
  max_capacity: 100000,
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function VenuesPage() {
  const [filters, setFilters] = useState<VenueFiltersExtended>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [geoLoading, setGeoLoading] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["venues", "list"],
    queryFn: () => venuesService.list({ limit: 300, offset: 0 }),
  });

  const venues = data?.items || [];

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

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          v.venue_name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          (v.address || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.state && v.state !== filters.state) return false;
      if (filters.city && !v.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (v.capacity < filters.min_capacity || v.capacity > filters.max_capacity) return false;

      // Radius filter
      if (filters.user_lat !== null && filters.user_lng !== null && v.lat && v.lng) {
        const dist = haversineKm(filters.user_lat, filters.user_lng, v.lat, v.lng);
        if (dist > filters.radius_km) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by proximity if location is set
      if (filters.user_lat !== null && filters.user_lng !== null && a.lat && a.lng && b.lat && b.lng) {
        const distA = haversineKm(filters.user_lat, filters.user_lng, a.lat, a.lng);
        const distB = haversineKm(filters.user_lat, filters.user_lng, b.lat, b.lng);
        return distA - distB;
      }
      return 0;
    });
  }, [filters, venues]);

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeFilterCount = [
    filters.state !== "",
    filters.city !== "",
    filters.min_capacity > 0,
    filters.user_lat !== null,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const hasLocation = filters.user_lat !== null;

  return (
    <>
      <InternalHeader title="Venues" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header description */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Encontre venues próximas</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Busque venues por cidade, estado ou use sua localização para encontrar as mais próximas de você.
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="glass rounded-xl p-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar venue, cidade ou endereço..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="pl-9 bg-transparent border-0 focus-visible:ring-0"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0 relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass rounded-xl overflow-hidden"
            >
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
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                        <X className="h-3 w-3 mr-1" /> Limpar filtros
                      </Button>
                    </div>
                  )}

                  {/* Location / proximity section */}
                  <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="text-xs font-medium text-foreground">Filtrar por proximidade</Label>
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
                          Distância: {filters.radius_km} km
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
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <CitySearch
                      compact
                      required={false}
                      label="Cidade"
                      value={filters.city}
                      onCitySelect={(city) =>
                        setFilters((f) => ({
                          ...f,
                          city: city.name,
                          state: city.state,
                        }))
                      }
                      placeholder="Digite a cidade para buscar..."
                    />
                  </div>

                  {/* State */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Estado</Label>
                    <Select
                      value={filters.state}
                      onValueChange={(v) => setFilters((f) => ({ ...f, state: v === "all" ? "" : v }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Todos os estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {BRAZIL_STATES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capacity */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Capacidade mínima</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      placeholder="0"
                      value={filters.min_capacity || ""}
                      onChange={(e) => setFilters((f) => ({ ...f, min_capacity: Number(e.target.value) || 0 }))}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Results */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} venue{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
              {hasLocation && ` (dentro de ${filters.radius_km} km)`}
            </p>
          </div>

          {isLoading ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">Carregando contratantes...</p>
            </div>
          ) : isError ? (
            <div className="glass rounded-xl p-12 text-center">
              <h3 className="font-heading font-semibold text-foreground mb-1">Erro ao carregar contratantes</h3>
              <p className="text-sm text-muted-foreground">Verifique a conexao com o backend.</p>
            </div>
          ) : displayed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map((venue, i) => (
                <motion.div key={venue.id} initial="hidden" animate="visible" custom={i + 2} variants={fadeUp}>
                  <VenueCard venue={venue} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <div className="glass rounded-xl p-12 text-center">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-foreground mb-1">Nenhuma venue encontrada</h3>
                <p className="text-sm text-muted-foreground">Tente aumentar o raio ou ajustar os filtros.</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
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
