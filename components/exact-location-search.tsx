"use client"

import { useEffect, useRef, useState } from "react"
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

/** Remove acentos/diacríticos para aumentar chance de match no Nominatim */
function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

async function searchNominatim(q: string): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", q)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "6")
  url.searchParams.set("addressdetails", "1")

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  })
  if (!res.ok) throw new Error("Nominatim error")
  return res.json() as Promise<NominatimResult[]>
}

export function ExactLocationSearch({ onSelectLocation }: ExactLocationSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = async (trimmed: string) => {
    if (!trimmed || trimmed.length < 3) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // 1ª tentativa: query original
      let data = await searchNominatim(trimmed)

      // 2ª tentativa: sem acentos (cobre "Sao Paulo" → "São Paulo" e variações)
      if (data.length === 0) {
        const stripped = stripDiacritics(trimmed)
        if (stripped !== trimmed) {
          data = await searchNominatim(stripped)
        }
      }

      // 3ª tentativa: cada palavra individualmente, filtra duplicatas por place_id
      if (data.length === 0) {
        const words = stripDiacritics(trimmed)
          .split(/\s+/)
          .filter((w) => w.length >= 3)
        const seen = new Set<number>()
        for (const word of words) {
          const partial = await searchNominatim(word)
          for (const r of partial) {
            if (!seen.has(r.place_id)) {
              seen.add(r.place_id)
              data.push(r)
            }
          }
          if (data.length >= 5) break
        }
      }

      setResults(data.slice(0, 6))
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounce: dispara busca automaticamente 600ms após parar de digitar
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(() => {
      void runSearch(trimmed)
    }, 600)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handleSelect = (item: NominatimResult) => {
    const lat = Number(item.lat)
    const lon = Number(item.lon)
    if (Number.isNaN(lat) || Number.isNaN(lon)) return
    onSelectLocation(lat, lon, item.display_name)
    setQuery(item.display_name)
    setResults([])
  }

  return (
    <div className="space-y-2.5">
      <div className="rounded-md border border-border/80 bg-muted/30 px-2.5 py-2">
        <p className="text-xs font-medium text-foreground">Buscar endereco ou local</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          As sugestoes aparecem conforme voce digita. Nao se preocupe com acentos ou pequenos erros de escrita.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Ex: Av. Paulista, 1578, Sao Paulo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void runSearch(query.trim())
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void runSearch(query.trim())}
          disabled={isSearching}
        >
          {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Buscar
        </Button>
      </div>

      {results.length > 0 && (
        <div className="rounded-md border border-primary/35 bg-background shadow-sm" data-testid="location-suggestions-container">
          <div className="border-b border-primary/20 bg-primary/5 px-3 py-2">
            <p className="text-xs font-semibold text-primary">Sugestoes encontradas ({results.length})</p>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {results.map((item) => (
              <button
                key={item.place_id}
                type="button"
                className="w-full border-b border-border/80 px-3 py-2 text-left text-xs text-foreground transition-colors last:border-b-0 hover:bg-primary/10 focus:bg-primary/10"
                onClick={() => handleSelect(item)}
              >
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isSearching && query.trim().length >= 3 && results.length === 0 && (
        <div className="rounded-md border border-dashed border-border px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Nenhuma sugestao encontrada. Tente adicionar a cidade ou estado ao nome do local.
          </p>
        </div>
      )}
    </div>
  )
}
