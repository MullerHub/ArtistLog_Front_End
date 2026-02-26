import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface PhotoGalleryProps {
  photos: string[]
  title?: string
  maxColumns?: number
}

export function PhotoGallery({
  photos,
  title = "Fotos Salvas",
  maxColumns = 4,
}: PhotoGalleryProps) {
  if (!photos || photos.length === 0) {
    return null
  }

  const resolvePhotoUrl = (photoUrl: string) =>
    photoUrl.startsWith("http") ? photoUrl : `${API_BASE_URL}${photoUrl}`

  const normalizedPhotos = photos.filter(
    (photoUrl) =>
      photoUrl &&
      photoUrl !== "/" &&
      photoUrl !== API_BASE_URL &&
      photoUrl !== `${API_BASE_URL}/`
  )

  if (normalizedPhotos.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-base font-semibold">{title}</Label>
      <div className={cn(
        "grid gap-3",
        `grid-cols-2 sm:grid-cols-3 lg:grid-cols-${maxColumns}`
      )}>
        {normalizedPhotos.map((photoUrl, index) => (
          <div
            key={`${photoUrl}-${index}`}
            className="aspect-square overflow-hidden rounded-lg bg-muted border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvePhotoUrl(photoUrl)}
              alt="Foto carregada"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
