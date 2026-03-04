// Geocoding service using Nominatim API

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    municipality?: string
    state?: string
    country?: string
  }
}

/**
 * Get coordinates for a city using Nominatim geocoding
 * @param cityName City name
 * @param stateName Optional state name for more precise results
 * @returns Coordinates or null if not found
 */
export async function getCityCoordinates(
  cityName: string,
  stateName?: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const query = stateName ? `${cityName}, ${stateName}, Brazil` : `${cityName}, Brazil`
    
    console.log('[GeocodingService] Fetching coordinates for:', query)
    
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("q", query)
    url.searchParams.set("format", "json")
    url.searchParams.set("limit", "1")
    url.searchParams.set("addressdetails", "1")

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    })

    if (!response.ok) {
      console.error('[GeocodingService] API error:', response.status)
      return null
    }

    const data = (await response.json()) as NominatimResult[]
    
    if (data.length === 0) {
      console.warn('[GeocodingService] No results found for:', query)
      return null
    }

    const result = data[0]
    const latitude = parseFloat(result.lat)
    const longitude = parseFloat(result.lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error('[GeocodingService] Invalid coordinates:', result)
      return null
    }

    console.log('[GeocodingService] Found coordinates:', { latitude, longitude, display_name: result.display_name })
    
    return { latitude, longitude }
  } catch (error) {
    console.error('[GeocodingService] Error fetching city coordinates:', error)
    return null
  }
}
