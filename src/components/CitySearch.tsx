import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { locationService } from "@/services/location-service";
import type { City } from "@/types/location";

interface CitySearchProps {
  value?: string;
  onCitySelect: (city: City) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
}

export function CitySearch({
  value,
  onCitySelect,
  error,
  label = "Cidade",
  placeholder = "Digite o nome da cidade...",
  required = true,
  compact = false,
}: CitySearchProps) {
  const [query, setQuery] = useState(value || "");
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputIdRef = useRef(`city-search-${Math.random().toString(36).slice(2, 10)}`);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value && !selectedCity) {
      setQuery(value);
    }
  }, [value, selectedCity]);

  const handleSearch = useCallback(async (nextQuery: string) => {
    if (nextQuery.length < 1) {
      setCities([]);
      setLoadError(null);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await locationService.searchCities(nextQuery);
      const nextCities = response.cities || [];
      setCities(nextCities);
      setShowDropdown(true);
      setLoadError(nextCities.length === 0 ? "Nenhuma cidade encontrada com esse termo" : null);
    } catch {
      setCities([]);
      setLoadError("Erro ao buscar cidades. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!query) {
      setCities([]);
      setShowDropdown(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, handleSearch]);

  const selectCity = (city: City) => {
    setSelectedCity(city);
    setQuery(city.name);
    setShowDropdown(false);
    setLoadError(null);
    setCities([]);
    onCitySelect(city);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || cities.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev < cities.length - 1 ? prev + 1 : prev));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0) {
        selectCity(cities[highlightedIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor={inputIdRef.current} className={compact ? "text-xs text-muted-foreground mb-1.5 block" : undefined}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id={inputIdRef.current}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(-1);
            setSelectedCity(null);
            if (!event.target.value) {
              setLoadError(null);
            }
          }}
          onFocus={() => query.length > 0 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls={`${inputIdRef.current}-dropdown`}
          className={error || loadError ? "border-destructive" : undefined}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {error && !selectedCity && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {loadError && !error && !isLoading && <p className="mt-1 text-xs text-amber-600">{loadError}</p>}

      {showDropdown && cities.length > 0 && !isLoading && (
        <div
          id={`${inputIdRef.current}-dropdown`}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-md border bg-popover shadow-md"
          role="listbox"
        >
          {cities.map((city, index) => (
            <button
              key={`${city.name}-${city.state}`}
              type="button"
              onClick={() => selectCity(city)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                highlightedIndex === index ? "bg-primary/10" : "hover:bg-muted"
              }`}
              role="option"
              aria-selected={selectedCity?.name === city.name && selectedCity?.state === city.state}
            >
              <span className="font-medium">{city.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{city.state}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
