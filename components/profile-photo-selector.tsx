import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface ProfilePhotoSelectorProps {
  photos: string[]
  selectedPhoto: string | null
  onSelect: (photoUrl: string) => void
}

export function ProfilePhotoSelector({
  photos,
  selectedPhoto,
  onSelect,
}: ProfilePhotoSelectorProps) {
  const resolvePhotoUrl = (photoUrl: string) =>
    photoUrl.startsWith("http") ? photoUrl : `${API_BASE_URL}${photoUrl}`

  if (!photos || photos.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground p-4">
        <p className="text-sm text-muted-foreground">
          Nenhuma foto disponível. Adicione fotos acima para selecionar uma como foto de perfil.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-base font-semibold">Foto de Perfil</Label>
      <p className="text-xs text-muted-foreground">
        Selecione qual foto aparecerá como thumbnail do seu perfil
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photoUrl) => (
          <button
            key={photoUrl}
            type="button"
            onClick={() => onSelect(photoUrl)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-primary",
              selectedPhoto === photoUrl
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "border-muted hover:border-muted-foreground"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvePhotoUrl(photoUrl)}
              alt="Opção de foto"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {selectedPhoto === photoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Check className="h-6 w-6 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
