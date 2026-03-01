"use client"

import { useState } from "react"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface ExactLocationSearchProps {
  onSelectLocation: (latitude: number, longitude: number, label: string) => void
}

export function ExactLocationSearch({ onSelectLocation }: ExactLocationSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search")
      url.searchParams.set("q", trimmed)
      url.searchParams.set("format", "json")
      url.searchParams.set("limit", "5")
      url.searchParams.set("addressdetails", "1")

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao buscar endereço")
      }

      const data = (await response.json()) as NominatimResult[]
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelect = (item: NominatimResult) => {
    const latitude = Number(item.lat)
    const longitude = Number(item.lon)

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return
    }

    onSelectLocation(latitude, longitude, item.display_name)
    setQuery(item.display_name)
    setResults([])
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Buscar endereço (Nominatim/OpenStreetMap)</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Ex: Av. Paulista, 1578, São Paulo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void handleSearch()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => void handleSearch()} disabled={isSearching}>
          {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Buscar
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-52 overflow-y-auto rounded-md border border-border">
          {results.map((item) => (
            <button
              key={item.place_id}
              type="button"
              className="w-full border-b border-border px-3 py-2 text-left text-xs text-muted-foreground last:border-b-0 hover:bg-muted"
              onClick={() => handleSelect(item)}
            >
              {item.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
