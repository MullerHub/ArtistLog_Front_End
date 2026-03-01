"use client"

import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExactLocationMap } from "@/components/exact-location-map"
import { ExactLocationSearch } from "@/components/exact-location-search"

interface ExactLocationManagerProps {
  latitude: number | null
  longitude: number | null
  baseLatitude: number | null
  baseLongitude: number | null
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
  isUpdating,
  onLatitudeChange,
  onLongitudeChange,
  onUseCurrentLocation,
  onUseBaseLocation,
  onSave,
}: ExactLocationManagerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <Label className="text-sm font-semibold">Localização Exata (ExactLocation)</Label>
      <p className="text-xs text-muted-foreground">
        Selecione visualmente no mapa, busque por endereço ou preencha latitude/longitude manualmente.
      </p>

      <ExactLocationSearch
        onSelectLocation={(selectedLatitude, selectedLongitude) => {
          onLatitudeChange(selectedLatitude)
          onLongitudeChange(selectedLongitude)
        }}
      />

      <ExactLocationMap
        latitude={latitude}
        longitude={longitude}
        baseLatitude={baseLatitude}
        baseLongitude={baseLongitude}
        onPickLocation={(pickedLatitude, pickedLongitude) => {
          onLatitudeChange(pickedLatitude)
          onLongitudeChange(pickedLongitude)
        }}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          type="number"
          step="any"
          placeholder="Latitude exata"
          value={latitude ?? ""}
          onChange={(e) => onLatitudeChange(e.target.value === "" ? null : Number(e.target.value))}
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude exata"
          value={longitude ?? ""}
          onChange={(e) => onLongitudeChange(e.target.value === "" ? null : Number(e.target.value))}
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
        <Button type="button" onClick={onSave} disabled={isUpdating}>
          {isUpdating ? "Salvando..." : "Salvar localização exata"}
        </Button>
      </div>

      {latitude !== null && longitude !== null && (
        <p className="text-xs text-muted-foreground">
          ExactLocation: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  )
}
