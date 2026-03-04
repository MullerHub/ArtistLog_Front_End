"use client"

import { useEffect, useState } from "react"
import { MapPin, History, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExactLocationMap } from "@/components/exact-location-map"
import { ExactLocationSearch } from "@/components/exact-location-search"

interface LocationHistoryItem {
  latitude: number
  longitude: number
  timestamp: string
  label?: string
}

interface ExactLocationManagerProps {
  latitude: number | null
  longitude: number | null
  baseLatitude: number | null
  baseLongitude: number | null
  cityName?: string
  stateName?: string
  isUpdating: boolean
  onLatitudeChange: (value: number | null) => void
  onLongitudeChange: (value: number | null) => void
  onUseCurrentLocation: () => void
  onUseBaseLocation: () => void
  onSave: () => void
}

export function ExactLocationManager({
  latitude,
  longitude,
  baseLatitude,
  baseLongitude,
  cityName,
  stateName,
  isUpdating,
  onLatitudeChange,
  onLongitudeChange,
  onUseCurrentLocation,
  onUseBaseLocation,
  onSave,
}: ExactLocationManagerProps) {
  const [history, setHistory] = useState<LocationHistoryItem[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("venue_location_history")
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const validateCoordinates = (lat: number | null, lon: number | null): string | null => {
    if (lat === null || lon === null) {
      return "É necessário definir latitude E longitude para salvar a localização exata"
    }

    if (lat < -90 || lat > 90) {
      return "Latitude deve estar entre -90 e 90"
    }

    if (lon < -180 || lon > 180) {
      return "Longitude deve estar entre -180 e 180"
    }

    return null
  }

  const handleCoordinateChange = (lat: number | null, lon: number | null) => {
    onLatitudeChange(lat)
    onLongitudeChange(lon)

    const error = validateCoordinates(lat, lon)
    setValidationError(error)
  }

  const handleSaveWithHistory = () => {
    const error = validateCoordinates(latitude, longitude)
    if (error) {
      setValidationError(error)
      return
    }

    if (latitude !== null && longitude !== null) {
      const newItem: LocationHistoryItem = {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      }

      const updatedHistory = [newItem, ...history].slice(0, 5)
      setHistory(updatedHistory)
      localStorage.setItem("venue_location_history", JSON.stringify(updatedHistory))
      console.log('💾 [History] Saved location:', { lat: latitude, lng: longitude })
    }

    setValidationError(null)
    onSave()
  }

  const loadFromHistory = (item: LocationHistoryItem) => {
    onLatitudeChange(item.latitude)
    onLongitudeChange(item.longitude)
    setValidationError(null)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <Label className="text-sm font-semibold">Localização Exata (ExactLocation)</Label>
      <p className="text-xs text-muted-foreground">
        Selecione visualmente no mapa, busque por endereço ou preencha latitude/longitude manualmente.
      </p>

      <ExactLocationSearch
        onSelectLocation={(selectedLatitude, selectedLongitude) => {
          handleCoordinateChange(selectedLatitude, selectedLongitude)
        }}
      />

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <ExactLocationMap
        latitude={latitude}
        longitude={longitude}
        cityName={cityName}
        stateName={stateName}
        baseLatitude={baseLatitude}
        baseLongitude={baseLongitude}
        onPickLocation={(pickedLatitude, pickedLongitude) => {
          handleCoordinateChange(pickedLatitude, pickedLongitude)
        }}
      />

      {history.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="h-3 w-3" />
            Últimas localizações
          </Label>
          <div className="flex flex-wrap gap-2">
            {history.map((item, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadFromHistory(item)}
                className="text-xs"
              >
                📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          type="number"
          step="any"
          placeholder="Latitude exata"
          value={latitude ?? ""}
          onChange={(e) => handleCoordinateChange(e.target.value === "" ? null : Number(e.target.value), longitude)}
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude exata"
          value={longitude ?? ""}
          onChange={(e) => handleCoordinateChange(latitude, e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" onClick={onUseBaseLocation} disabled={isUpdating}>
          <MapPin className="mr-2 h-4 w-4" />
          Usar localização base da venue
        </Button>
        <Button type="button" variant="outline" onClick={onUseCurrentLocation} disabled={isUpdating}>
          Usar minha localização atual
        </Button>
        <Button type="button" onClick={handleSaveWithHistory} disabled={isUpdating || validationError !== null}>
          {isUpdating ? "Salvando..." : "Salvar localização exata"}
        </Button>
      </div>

      {typeof latitude === 'number' && typeof longitude === 'number' && (
        <p className="text-xs text-muted-foreground">
          ExactLocation: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  )
}
