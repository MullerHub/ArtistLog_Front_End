"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { locationService } from "@/lib/services/location.service"
import type { City } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface CitySearchProps {
  value?: string
  onChange?: (city: City) => void
  onCitySelect?: (city: City) => void
  error?: string
  label?: string
  placeholder?: string
  required?: boolean
}

export function CitySearch({
  value,
  onChange,
  onCitySelect,
  error,
  label = "Cidade",
  placeholder = "Digite o nome da cidade...",
  required = true,
}: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState(value || "")
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincroniza o prop value com o estado interno
  useEffect(() => {
    if (value && !selectedCity) {
      setSearchQuery(value)
    }
  }, [value, selectedCity])

  // Quando a query muda, faz a busca
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setCities([])
      setLoadError(null)
      return
    }

    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await locationService.searchCities(query)
      setCities(response.cities || [])
      setShowDropdown(true)
      if (!response.cities || response.cities.length === 0) {
        setLoadError("Nenhuma cidade encontrada com esse termo")
      } else {
        // Limpar erro quando cidades são encontradas
        setLoadError(null)
      }
    } catch (err) {
      console.error("Erro ao buscar cidades:", err)
      setCities([])
      // Não mostrar erro de load failure como mensagem de "Required" - é só um erro de rede
      // O usuário pode continuar digitando
      setLoadError("Erro ao buscar. Verifique sua conexão ou tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce da busca
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length === 0) {
      setCities([])
      setShowDropdown(false)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300) // 300ms de debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, handleSearch])

  const handleSelectCity = (city: City) => {
    setSelectedCity(city)
    setSearchQuery("") // Reset para vazio após seleção
    setShowDropdown(false)
    setLoadError(null) // Limpar erro quando selecionada
    setCities([]) // Limpar cidades da dropdown
    // Chamar ambos os callbacks se fornecidos
    if (onChange) onChange(city)
    if (onCitySelect) onCitySelect(city)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchQuery(newQuery)
    setHighlightedIndex(-1)
    // Se o usuário limpar o campo
    if (newQuery === "") {
      setSelectedCity(null)
      setCities([])
      setLoadError(null) // Limpar erro também
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || cities.length === 0) {
      if (e.key === "ArrowDown" && searchQuery) {
        e.preventDefault()
        setShowDropdown(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < cities.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && cities[highlightedIndex]) {
          handleSelectCity(cities[highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowDropdown(false)
        setHighlightedIndex(-1)
        break
      default:
        break
    }
  }

  return (
    <div className="flex flex-col gap-2 relative">
      {label && (
        <Label htmlFor="city-search">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id="city-search"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={error || loadError ? "border-destructive" : ""}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="city-dropdown"
          aria-autocomplete="list"
          aria-label={label}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Só mostra erro de validação se não estiver digitando e não tiver cidade selecionada */}
      {error && !searchQuery && <p className="text-sm text-destructive">{error}</p>}
      {/* Só mostra loadError se não houver cidades encontradas */}
      {loadError && !error && !isLoading && cities.length === 0 && (
        <p className="text-sm text-amber-600">{loadError}</p>
      )}
      
      {/* Dica de digitação */}
      {!selectedCity && searchQuery && !isLoading && !loadError && cities.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Digite para buscar cidades no Brasil
        </p>
      )}

      {/* Dropdown de cidades */}
      {showDropdown && cities.length > 0 && !isLoading && (
        <div
          ref={dropdownRef}
          id="city-dropdown"
          className="absolute top-full left-0 right-0 z-[100] mt-1 max-h-64 overflow-y-auto rounded-md border bg-popover shadow-md"
          role="listbox"
        >
          {cities.map((city, index) => (
            <button
              key={`${city.name}-${city.state}`}
              type="button"
              onClick={() => handleSelectCity(city)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary ${
                highlightedIndex === index ? "bg-primary/10" : "hover:bg-muted"
              }`}
              role="option"
              aria-selected={selectedCity?.name === city.name && selectedCity?.state === city.state}
              tabIndex={highlightedIndex === index ? 0 : -1}
            >
              <span>
                <strong>{city.name}</strong>
                <span className="ml-2 text-muted-foreground text-xs">{city.state}</span>
              </span>
              {selectedCity?.name === city.name && selectedCity?.state === city.state && (
                <span className="text-primary font-semibold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mensagem quando nenhuma cidade é encontrada */}
      {showDropdown && searchQuery.length > 0 && cities.length === 0 && !isLoading && !loadError && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold mb-2">🔍 Nenhuma cidade encontrada</div>
          <ul className="text-xs space-y-1">
            <li>• Verifique se digitou corretamente</li>
            <li>• Tente um prefixo maior (ex: "São" ao invés de "S")</li>
            <li>• Exemplo: "São Paulo", "Rio de Janeiro", "Curitiba"</li>
          </ul>
        </div>
      )}

      {/* Mostra a cidade selecionada em pequeno */}
      {selectedCity && (
        <p className="text-xs text-muted-foreground">
          Selecionado: <strong>{selectedCity.name}</strong> ({selectedCity.state})
        </p>
      )}
    </div>
  )
}
