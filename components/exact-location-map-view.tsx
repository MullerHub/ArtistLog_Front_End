"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet"
import { calculateDistance, formatDistance } from "@/lib/geo"

interface ExactLocationMapViewProps {
  latitude: number | null
  longitude: number | null
  baseLatitude: number | null
  baseLongitude: number | null
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
  onPickLocation,
}: ExactLocationMapViewProps) {
  const [dragDistance, setDragDistance] = useState<number | null>(null)
  const markerRef = useRef<L.Marker>(null)

  const center = useMemo<[number, number]>(() => {
    if (latitude !== null && longitude !== null) {
      return [latitude, longitude]
    }

    if (baseLatitude !== null && baseLongitude !== null) {
      return [baseLatitude, baseLongitude]
    }

    return [-14.235, -51.9253]
  }, [latitude, longitude, baseLatitude, baseLongitude])

  const selectedPosition =
    latitude !== null && longitude !== null ? ([latitude, longitude] as [number, number]) : null

  const basePosition =
    baseLatitude !== null && baseLongitude !== null ? ([baseLatitude, baseLongitude] as [number, number]) : null

  const handleDragStart = () => {
    if (baseLatitude !== null && baseLongitude !== null && latitude !== null && longitude !== null) {
      const distance = calculateDistance(
        { latitude: baseLatitude, longitude: baseLongitude },
        { latitude, longitude }
      )
      setDragDistance(distance)
    }
  }

  const handleDrag = () => {
    const marker = markerRef.current
    if (marker && baseLatitude !== null && baseLongitude !== null) {
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
      onPickLocation(position.lat, position.lng)
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
