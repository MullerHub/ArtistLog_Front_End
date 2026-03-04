"use client"

import dynamic from "next/dynamic"

interface ExactLocationMapProps {
  latitude: number | null
  longitude: number | null
  baseLatitude: number | null
  baseLongitude: number | null
  cityName?: string
  stateName?: string
  onPickLocation: (latitude: number, longitude: number) => void
}

const ExactLocationMapView = dynamic(() => import("@/components/exact-location-map-view"), {
  ssr: false,
})

export function ExactLocationMap(props: ExactLocationMapProps) {
  return <ExactLocationMapView {...props} />
}
