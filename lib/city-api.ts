// frontend/lib/city-api.ts

import type { GeoPoint } from "./types"

const API_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client"
const cityCache = new Map<string, string | null>()

function getCacheKey(coords: GeoPoint) {
  return `${coords.latitude.toFixed(4)}:${coords.longitude.toFixed(4)}`
}

interface ReverseGeocodeResponse {
  latitude: number
  longitude: number
  continent: string
  lookupSource: string
  continentCode: string
  localityLanguageRequested: string
  city: string
  countryName: string
  countryCode: string
  postcode: string
  principalSubdivision: string
  principalSubdivisionCode: string
  plusCode: string
  locality: string
  localityInfo: {
    administrative: {
      order: number
      adminLevel: number
      name: string
      description: string
      isoName?: string
      isoCode?: string
      wikidataId?: string
      geonameId?: number
    }[]
    informative: {
      order: number
      name: string
      description: string
      isoCode?: string
      wikidataId?: string
      geonameId?: number
    }[]
  }
}

export async function getCityFromCoordinates(
  coords: GeoPoint
): Promise<string | null> {
  try {
    const cacheKey = getCacheKey(coords)
    if (cityCache.has(cacheKey)) {
      return cityCache.get(cacheKey) ?? null
    }

    const response = await fetch(
      `${API_URL}?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=pt-BR`
    )
    if (!response.ok) {
      console.error("Failed to fetch city from coordinates")
      cityCache.set(cacheKey, null)
      return null
    }
    const data: ReverseGeocodeResponse = await response.json()
    const city = data.city || data.locality || null
    cityCache.set(cacheKey, city)
    return city
  } catch (error) {
    console.error("Error fetching city:", error)
    return null
  }
}
