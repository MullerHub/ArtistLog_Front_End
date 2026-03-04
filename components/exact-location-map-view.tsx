"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet"
import { calculateDistance, formatDistance } from "@/lib/geo"
import { getCityCoordinates } from "@/lib/services/geocoding.service"

interface ExactLocationMapViewProps {
  latitude: number | null
  longitude: number | null
  baseLatitude: number | null
  baseLongitude: number | null
  cityName?: string
  stateName?: string
  onPickLocation: (latitude: number, longitude: number) => void
}

const exactMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const baseMarkerIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function ClickHandler({ onPickLocation }: { onPickLocation: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      onPickLocation(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function MapController({
  latitude,
  longitude,
}: {
  latitude: number | null
  longitude: number | null
}) {
  const map = useMap()

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      map.setView([latitude, longitude], 15, { animate: true })
    }
  }, [latitude, longitude, map])

  return null
}

export default function ExactLocationMapView({
  latitude,
  longitude,
  baseLatitude,
  baseLongitude,
  cityName,
  stateName,
  onPickLocation,
}: ExactLocationMapViewProps) {
  const [dragDistance, setDragDistance] = useState<number | null>(null)
  const [cityCoordinates, setCityCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const markerRef = useRef<L.Marker>(null)

  // Fetch city coordinates when no base location is available
  useEffect(() => {
    if (baseLatitude === null && baseLongitude === null && cityName) {
      getCityCoordinates(cityName, stateName).then((coords) => {
        if (coords) {
          setCityCoordinates(coords)
        }
      })
    }
  }, [baseLatitude, baseLongitude, cityName, stateName])

  const center: [number, number] = useMemo(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
      return [latitude, longitude]
    }

    if (typeof baseLatitude === 'number' && typeof baseLongitude === 'number' && !isNaN(baseLatitude) && !isNaN(baseLongitude)) {
      return [baseLatitude, baseLongitude]
    }

    if (cityCoordinates && typeof cityCoordinates.latitude === 'number' && typeof cityCoordinates.longitude === 'number') {
      return [cityCoordinates.latitude, cityCoordinates.longitude]
    }

    // Default fallback: center of Brazil
    return [-14.235, -51.9253]
  }, [latitude, longitude, baseLatitude, baseLongitude, cityCoordinates])

  const selectedPosition: [number, number] | null =
    typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)
      ? [latitude, longitude]
      : null

  const basePosition: [number, number] | null =
    typeof baseLatitude === 'number' && typeof baseLongitude === 'number' && !isNaN(baseLatitude) && !isNaN(baseLongitude)
      ? [baseLatitude, baseLongitude]
      : null

  // Defensive check - ensure center is always valid before rendering map
  if (!center || center.length !== 2 || typeof center[0] !== 'number' || typeof center[1] !== 'number' || isNaN(center[0]) || isNaN(center[1])) {
    console.error('❌ [Map] Invalid center:', center)
    return (
      <div className="overflow-hidden rounded-md border border-border p-4 text-center text-muted-foreground">
        Carregando mapa...
      </div>
    )
  }

  const handleDragStart = () => {
    if (typeof baseLatitude === 'number' && typeof baseLongitude === 'number' && typeof latitude === 'number' && typeof longitude === 'number') {
      const distance = calculateDistance(
        { latitude: baseLatitude, longitude: baseLongitude },
        { latitude, longitude }
      )
      setDragDistance(distance)
    }
  }

  const handleDrag = () => {
    const marker = markerRef.current
    if (marker && typeof baseLatitude === 'number' && typeof baseLongitude === 'number') {
      const position = marker.getLatLng()
      const distance = calculateDistance(
        { latitude: baseLatitude, longitude: baseLongitude },
        { latitude: position.lat, longitude: position.lng }
      )
      setDragDistance(distance)
    }
  }

  const handleDragEnd = () => {
    const marker = markerRef.current
    if (marker) {
      const position = marker.getLatLng()
      const lat = position.lat
      const lng = position.lng
      
      // Validate position before calling callback
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        console.log('📍 [Map] New position selected:', { lat, lng })
        onPickLocation(lat, lng)
      } else {
        console.error('❌ [Map] Invalid position from drag:', { lat, lng })
      }
      setDragDistance(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <MapContainer center={center} zoom={selectedPosition ? 16 : 5} className="h-72 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPickLocation={onPickLocation} />
        <MapController latitude={latitude} longitude={longitude} />
        
        {basePosition && (
          <Marker position={basePosition} icon={baseMarkerIcon}>
            <Popup>📍 Localização Base da Venue</Popup>
          </Marker>
        )}
        
        {selectedPosition && (
          <Marker
            position={selectedPosition}
            icon={exactMarkerIcon}
            draggable={true}
            ref={markerRef}
            eventHandlers={{
              dragstart: handleDragStart,
              drag: handleDrag,
              dragend: handleDragEnd,
            }}
          >
            <Popup>🎯 Localização Exata Selecionada</Popup>
            {dragDistance !== null && (
              <Tooltip permanent direction="top" offset={[0, -40]}>
                📏 {formatDistance(dragDistance)} da base
              </Tooltip>
            )}
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
