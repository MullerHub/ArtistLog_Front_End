"use client"

import { Star, MapPin, Music } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ArtistResponse } from "@/lib/types"

export function ArtistCardDetail({ artist }: { artist: ArtistResponse }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{artist.stage_name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{artist.bio}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{artist.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Music className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Cache Base:</span>
            <span>{formatCurrency(artist.cache_base || 0)}</span>
          </div>
          
          {artist.base_location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {artist.base_location.latitude?.toFixed(2)}, {artist.base_location.longitude?.toFixed(2)}
              </span>
            </div>
          )}

          {artist.tags && artist.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {artist.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {artist.is_available ? (
              <span className="text-green-600 font-semibold">✓ Disponível</span>
            ) : (
              <span className="text-red-600">✗ Indisponível</span>
            )}
          </div>
        </div>

        <Link href={`/artists/${artist.id}`}>
          <Button className="w-full">Ver Perfil</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
