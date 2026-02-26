"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import useSWR from "swr"
import { Loader2, User, Save, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PhotoUpload } from "@/components/photo-upload"
import { PhotoGallery } from "@/components/photo-gallery"
import { FormErrorsAlert } from "@/components/form-errors-alert"
import { ProfilePhotoSelector } from "@/components/profile-photo-selector"
import { useAuth } from "@/lib/auth-context"
import { artistsService } from "@/lib/services/artists.service"
import { venuesService } from "@/lib/services/venues.service"
import { formatPhoneNumber } from "@/lib/formatters/phone"
import { API_BASE_URL } from "@/lib/api-client"
import { toast } from "sonner"

const artistProfileSchema = z.object({
  stage_name: z.string().min(2).max(150).optional(),
  bio: z.string().max(500).optional(),
  cache_base: z.coerce.number().positive().optional(),
  is_available: z.boolean().optional(),
})

const venueProfileSchema = z.object({
  venue_name: z.string().min(2).max(150).optional(),
  capacity: z.coerce.number().int().positive().optional(),
  infrastructure: z.string().optional(),
  description: z.string().max(500).optional(),
  phone: z.string().optional(),
  website: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().url("Website deve ser uma URL válida").optional()),
})

type ArtistProfileForm = z.infer<typeof artistProfileSchema>
type VenueProfileForm = z.infer<typeof venueProfileSchema>

const sanitizePhotoUrls = (urls?: string[]) =>
  (urls ?? []).filter(
    (url) =>
      url && url !== "/" && url !== API_BASE_URL && url !== `${API_BASE_URL}/`
  )

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e preferencias</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground">{user?.email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tipo</span>
            <span className="text-sm font-medium capitalize text-foreground">{user?.role.toLowerCase()}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ID</span>
            <span className="font-mono text-xs text-muted-foreground">{user?.id}</span>
          </div>
        </CardContent>
      </Card>

      {user?.role === "ARTIST" && <ArtistProfileSettings />}
      {user?.role === "VENUE" && <VenueProfileSettings />}
    </div>
  )
}

function ArtistProfileSettings() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  // Carregar dados do perfil existente
  const { data: artistData } = useSWR(
    user?.id ? ["artist-profile", user.id] : null,
    () => artistsService.getById(user!.id),
    { revalidateOnFocus: false }
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ArtistProfileForm>({
    resolver: zodResolver(artistProfileSchema),
    mode: "onChange",
  })

  // Inicializar fotos e preencher form quando dados carregarem
  useEffect(() => {
    if (artistData) {
      if (artistData.photo_urls) {
        const sanitizedPhotos = sanitizePhotoUrls(artistData.photo_urls)
        setPhotoUrls(sanitizedPhotos)
        if (artistData.profile_photo && sanitizedPhotos.includes(artistData.profile_photo)) {
          setProfilePhoto(artistData.profile_photo)
        } else {
          setProfilePhoto(null)
        }
      }
      // Preencher campos do formulário
      reset({
        stage_name: artistData.stage_name || "",
        bio: artistData.bio || "",
        cache_base: artistData.cache_base || undefined,
      })
    }
  }, [artistData, reset])

  async function onSubmit(data: ArtistProfileForm) {
    if (!user) return
    
    // Se houver erros de validação, mostrar alert
    if (!isValid && Object.keys(errors).length > 0) {
      setShowErrors(true)
      return
    }

    setIsSubmitting(true)
    try {
      // Remover campos vazios/undefined para não enviar ao backend
      const cleanData: Record<string, any> = {}
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          cleanData[key] = value
        }
      })

      const profileData: Record<string, any> = { ...cleanData, photo_urls: photoUrls }
      if (profilePhoto) {
        profileData.profile_photo = profilePhoto
      }

      await artistsService.updateProfile(user.id, profileData)
      toast.success("✅ Perfil atualizado com sucesso!")
      setShowErrors(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil"
      toast.error(`❌ Erro: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formErrors = Object.values(errors)
    .map((error) => (typeof error?.message === "string" ? error.message : null))
    .filter((message): message is string => Boolean(message))

  return (
    <>
      <FormErrorsAlert errors={formErrors} isOpen={showErrors} onClose={() => setShowErrors(false)} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfil do Artista</CardTitle>
          <CardDescription>Atualize suas informacoes profissionais</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-4">
          {photoUrls.length > 0 && (
            <>
              <PhotoGallery photos={photoUrls} title="Fotos Salvas no Perfil" />
              <Separator />
            </>
          )}
          <PhotoUpload
            currentPhotos={photoUrls}
            onPhotosChange={setPhotoUrls}
            maxPhotos={5}
            label="Adicionar Mais Fotos"
          />
          {photoUrls.length > 0 && (
            <>
              <ProfilePhotoSelector
                photos={photoUrls}
                selectedPhoto={profilePhoto}
                onSelect={setProfilePhoto}
              />
              <Separator />
            </>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="stage_name">Nome Artistico</Label>
            <Input id="stage_name" placeholder="Seu nome artistico" {...register("stage_name")} />
            {errors.stage_name && <p className="text-sm text-destructive">{errors.stage_name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Fale sobre voce..." rows={3} {...register("bio")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cache_base">Cache Base (R$)</Label>
            <Input id="cache_base" type="number" placeholder="500" {...register("cache_base")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
    </>
  )
}

function VenueProfileSettings() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [venuePhotos, setVenuePhotos] = useState<string[]>([])
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  // Carregar dados do perfil existente
  const { data: venueData } = useSWR(
    user?.id ? ["venue-profile", user.id] : null,
    () => venuesService.getById(user!.id),
    { revalidateOnFocus: false }
  )

  // Inicializar fotos e localização quando dados carregarem
  useEffect(() => {
    if (venueData?.venue_photos) {
      const sanitizedPhotos = sanitizePhotoUrls(venueData.venue_photos)
      setVenuePhotos(sanitizedPhotos)
      // Se houver uma foto de perfil salva, selecionar ela
      if (venueData.profile_photo && sanitizedPhotos.includes(venueData.profile_photo)) {
        setProfilePhoto(venueData.profile_photo)
      } else {
        setProfilePhoto(null)
      }
    }
    if (venueData?.base_location) {
      setLatitude(venueData.base_location.latitude)
      setLongitude(venueData.base_location.longitude)
    }
  }, [venueData])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<VenueProfileForm>({
    resolver: zodResolver(venueProfileSchema),
    mode: "onChange",
  })

  // Preencher form quando dados carregarem
  useEffect(() => {
    if (venueData) {
      reset({
        venue_name: venueData.venue_name || "",
        capacity: venueData.capacity || undefined,
        infrastructure: venueData.infrastructure || "",
        description: venueData.description || "",
        phone: venueData.phone || "",
        website: venueData.website || "",
      })
    }
  }, [venueData, reset])

  const handleUseLocation = () => {
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada neste navegador")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setIsLocating(false)
        toast.success(
          `Localização atualizada com sucesso! (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
        )
      },
      () => {
        setLocationError("Não foi possível obter sua localização")
        setIsLocating(false)
        toast.error("Não conseguimos acessar sua localização. Verifique as permissões do navegador.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function onSubmit(data: VenueProfileForm) {
    if (!user) return
    
    // Se houver erros de validação, mostrar alert
    if (!isValid && Object.keys(errors).length > 0) {
      setShowErrors(true)
      return
    }

    setIsSubmitting(true)
    try {
      // Remover campos vazios/undefined para não enviar ao backend
      const cleanData: Record<string, any> = {}
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          cleanData[key] = value
        }
      })

      // Preparar dados com localização se disponível
      const profileData: any = { ...cleanData, venue_photos: venuePhotos }
      
      if (profilePhoto) {
        profileData.profile_photo = profilePhoto
      }
      
      if (latitude !== null && longitude !== null) {
        profileData.base_location = {
          latitude,
          longitude,
        }
      }

      await venuesService.updateProfile(user.id, profileData)
      toast.success("✅ Perfil atualizado com sucesso!")
      setShowErrors(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil"
      toast.error(`❌ Erro: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <FormErrorsAlert errors={errors} isOpen={showErrors} onClose={() => setShowErrors(false)} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfil da Venue</CardTitle>
          <CardDescription>Atualize as informacoes do seu espaco</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            {venuePhotos.length > 0 && (
              <>
                <PhotoGallery photos={venuePhotos} title="Fotos Salvas da Venue" />
                <Separator />
              </>
            )}
            <PhotoUpload
              currentPhotos={venuePhotos}
              onPhotosChange={setVenuePhotos}
              maxPhotos={10}
              label="Adicionar Mais Fotos"
            />
            <Separator />
            
            {venuePhotos.length > 0 && (
              <>
                <ProfilePhotoSelector
                  photos={venuePhotos}
                  selectedPhoto={profilePhoto}
                  onSelect={setProfilePhoto}
                />
                <Separator />
              </>
            )}
          
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Localização da Venue
            </Label>
            <p className="text-xs text-muted-foreground">
              Defina a localização fixa de sua venue para que artists encontrem você
            </p>
            <Button type="button" variant="outline" onClick={handleUseLocation} disabled={isLocating} className="w-full">
              {isLocating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Localizando...
                </>
              ) : (
                "Usar minha localização atual"
              )}
            </Button>
            {locationError && (
              <p className="text-sm text-destructive">{locationError}</p>
            )}
            {latitude !== null && longitude !== null && (
              <p className="text-xs text-muted-foreground">
                Localização: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
          </div>
          
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="venue_name">Nome da Venue</Label>
            <Input id="venue_name" placeholder="Nome do espaco" {...register("venue_name")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="capacity">Capacidade</Label>
            <Input id="capacity" type="number" placeholder="200" {...register("capacity")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="infrastructure">Infraestrutura</Label>
            <Input id="infrastructure" placeholder="Som, Luz, Palco..." {...register("infrastructure")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea id="description" placeholder="Fale sobre o espaco..." rows={3} {...register("description")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register("phone", {
                onChange: (e) => {
                  const formatted = formatPhoneNumber(e.target.value)
                  e.target.value = formatted
                },
              })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://..." {...register("website")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
    </>
  )
}
