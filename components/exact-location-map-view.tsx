"use client"

import { useMemo } from "react"
import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

interface ExactLocationMapViewProps {
  latitude: number | null
  longitude: number | null
  baseLatitude: number | null
  baseLongitude: number | null
  onPickLocation: (latitude: number, longitude: number) => void
}

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function ClickHandler({ onPickLocation }: { onPickLocation: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      onPickLocation(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

export default function ExactLocationMapView({
  latitude,
  longitude,
  baseLatitude,
  baseLongitude,
  onPickLocation,
}: ExactLocationMapViewProps) {
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

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <MapContainer center={center} zoom={selectedPosition ? 16 : 5} className="h-72 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPickLocation={onPickLocation} />
        {selectedPosition && <Marker position={selectedPosition} icon={markerIcon} draggable={false} />}
      </MapContainer>
    </div>
  )
}
