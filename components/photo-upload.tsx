"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Upload, Loader2, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { API_BASE_URL } from "@/lib/api-client"
import { uploadService } from "@/lib/services/upload.service"
import { toast } from "sonner"

interface PhotoUploadProps {
  currentPhotos?: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
  label?: string
}

export function PhotoUpload({ 
  currentPhotos = [], 
  onPhotosChange, 
  maxPhotos = 5,
  label = "Fotos"
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resolvePhotoUrl = (photoUrl: string) =>
    photoUrl.startsWith("http") ? photoUrl : `${API_BASE_URL}${photoUrl}`

  const visiblePhotos = currentPhotos.filter(
    (photoUrl) =>
      photoUrl &&
      photoUrl !== "/" &&
      photoUrl !== API_BASE_URL &&
      photoUrl !== `${API_BASE_URL}/`
  )

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações claras e específicas
    const validFormats = ["image/jpeg", "image/png", "image/webp"]
    if (!validFormats.includes(file.type)) {
      toast.error(`Formato não suportado: ${file.type || "desconhecido"}. Use: JPG, PNG ou WebP`)
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1)
      toast.error(`Imagem muito grande (${sizeMB}MB). Tamanho máximo: 10MB`)
      return
    }

    // Preview local
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    try {
      const response = await uploadService.uploadPhoto(file)
      const newPhotos = [...currentPhotos, response.file_url]
      onPhotosChange(newPhotos)
      toast.success("Foto enviada com sucesso!")
      setPreviewUrl(null)
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido ao enviar foto"
      toast.error(message)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = (photoUrl: string) => {
    const newPhotos = currentPhotos.filter((url) => url !== photoUrl)
    onPhotosChange(newPhotos)
    toast.success("Foto removida")
  }

  const canAddMore = visiblePhotos.length < maxPhotos

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">
          Máximo de {maxPhotos} fotos · JPG/PNG/WebP · até 10MB cada
        </p>
      </div>

      {/* Grid de fotos existentes */}
      {visiblePhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visiblePhotos.map((photoUrl, index) => (
            <Card key={`${photoUrl}-${index}`} className="group relative overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={resolvePhotoUrl(photoUrl)} 
                  alt={`Foto ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleRemovePhoto(photoUrl)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview da foto sendo enviada */}
      {previewUrl && (
        <Card className="overflow-hidden border-dashed">
          <CardContent className="p-4">
            <img 
              src={previewUrl} 
              alt="Preview"
              className="h-32 w-full object-cover rounded"
            />
            {isUploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão de adicionar foto */}
      {canAddMore && !isUploading && (
        <label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Card className="cursor-pointer border-2 border-dashed transition-colors hover:border-primary hover:bg-accent">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-6">
              {visiblePhotos.length === 0 ? (
                <>
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Adicione fotos ao seu perfil</p>
                  <p className="text-xs text-muted-foreground">Clique para selecionar</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Adicionar mais ({visiblePhotos.length}/{maxPhotos})
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </label>
      )}

      {!canAddMore && (
        <p className="text-center text-xs text-muted-foreground">
          Limite de {maxPhotos} fotos atingido
        </p>
      )}
    </div>
  )
}
