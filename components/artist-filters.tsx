"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const GENRE_TAGS = [
  "Open Format",
  "15 anos",
  "Balada",
  "Eletronica",
  "House",
  "Techno",
  "Sertanejo",
  "Funk",
  "Pop",
  "Rock",
]

interface ArtistFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  genreSearch: string
  onGenreSearchChange: (value: string) => void
  eventTypeSearch: string
  onEventTypeSearchChange: (value: string) => void
  availableOnly: boolean
  onAvailableChange: (value: boolean) => void
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
  onCollapsedChange?: (collapsed: boolean) => void
}

export function ArtistFilters({
  search,
  onSearchChange,
  genreSearch,
  onGenreSearchChange,
  eventTypeSearch,
  onEventTypeSearchChange,
  availableOnly,
  onAvailableChange,
  selectedTags,
  onTagToggle,
  onClearFilters,
  onCollapsedChange,
}: ArtistFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const hasFilters = search || genreSearch || eventTypeSearch || availableOnly || selectedTags.length > 0

  const handleCollapse = () => {
    setIsCollapsed(true)
    onCollapsedChange?.(true)
  }

  const handleExpand = () => {
    setIsCollapsed(false)
    onCollapsedChange?.(false)
  }

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card p-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleExpand}
          aria-label="Expandir filtros"
          className="flex items-center gap-2 px-2 md:px-0"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="md:hidden text-xs font-semibold text-foreground">FILTROS</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCollapse}
            aria-label="Recolher filtros"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
          <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-7 text-xs">
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Genero musical (ex: Eletronica, House)"
          value={genreSearch}
          onChange={(e) => onGenreSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tipo de evento (ex: 15 anos, Balada)"
          value={eventTypeSearch}
          onChange={(e) => onEventTypeSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="available-filter" className="text-sm">
          Apenas disponiveis
        </Label>
        <Switch
          id="available-filter"
          checked={availableOnly}
          onCheckedChange={onAvailableChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Tags rapidas</span>
        <div className="flex flex-wrap gap-1.5">
          {GENRE_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
