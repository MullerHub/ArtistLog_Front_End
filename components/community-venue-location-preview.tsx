"use client"

interface CommunityVenueLocationPreviewProps {
  latitude: number
  longitude: number
  venueName: string
}

function formatEmbedUrl(latitude: number, longitude: number): string {
  const delta = 0.005
  const left = longitude - delta
  const right = longitude + delta
  const top = latitude + delta
  const bottom = latitude - delta

  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`
  const marker = `${latitude}%2C${longitude}`

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`
}

export function CommunityVenueLocationPreview({
  latitude,
  longitude,
  venueName,
}: CommunityVenueLocationPreviewProps) {
  const mapUrl = formatEmbedUrl(latitude, longitude)

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-border">
        <iframe
          title={`Mapa da localização de ${venueName}`}
          src={mapUrl}
          className="h-44 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Lat {latitude.toFixed(6)}, Lon {longitude.toFixed(6)}
      </p>
    </div>
  )
}
