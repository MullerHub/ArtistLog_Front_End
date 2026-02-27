"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Music, Mic, Building2, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/services/auth.service"
import { CitySearch } from "@/components/CitySearch"
import type { City } from "@/lib/types"
import { toast } from "sonner"

type RoleType = "ARTIST" | "VENUE" | null

const artistSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  confirmPassword: z.string(),
  stage_name: z.string().min(2, "Minimo 2 caracteres").max(150),
  bio: z.string().max(500).optional(),
  genres: z.string().max(300, "Máximo de 300 caracteres").optional(),
  cache_base: z.coerce.number().positive("Valor deve ser maior que 0"),
  city: z.string().min(1, "Cidade obrigatoria"),
  state: z.string().min(2, "Estado obrigatorio").max(2, "Use a sigla (ex: SP)"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas nao conferem",
  path: ["confirmPassword"],
})

const venueSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  confirmPassword: z.string(),
  venue_name: z.string().min(2, "Minimo 2 caracteres").max(150),
  capacity: z.coerce.number().int().positive("Deve ser maior que 0"),
  infrastructure: z.string().min(1, "Infraestrutura obrigatoria"),
  city: z.string().min(1, "Cidade obrigatoria"),
  state: z.string().min(2, "Estado obrigatorio").max(2, "Use a sigla (ex: SP)"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas nao conferem",
  path: ["confirmPassword"],
})

type ArtistForm = z.infer<typeof artistSchema>
type VenueForm = z.infer<typeof venueSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<RoleType>(null)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!role) {
    return <RoleSelector onSelect={setRole} />
  }

  if (role === "ARTIST") {
    return (
      <ArtistRegister
        step={step}
        setStep={setStep}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        router={router}
        onBack={() => { setRole(null); setStep(1) }}
      />
    )
  }

  return (
    <VenueRegister
      step={step}
      setStep={setStep}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      isSubmitting={isSubmitting}
      setIsSubmitting={setIsSubmitting}
      router={router}
      onBack={() => { setRole(null); setStep(1) }}
    />
  )
}

function RoleSelector({ onSelect }: { onSelect: (role: RoleType) => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-primary p-3">
          <Music className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Criar Conta</h1>
        <p className="text-sm text-muted-foreground">Escolha o tipo de conta</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <button
          onClick={() => onSelect("ARTIST")}
          className="flex items-center text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
          aria-label="Crear conta como Artista"
        >
          <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md w-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sou Artista</h3>
                <p className="text-sm text-muted-foreground">
                  DJ, musico, banda - crie seu perfil profissional
                </p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => onSelect("VENUE")}
          className="flex items-center text-left focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-lg"
          aria-label="Crear conta como Contratante"
        >
          <Card className="cursor-pointer transition-all hover:border-secondary hover:shadow-md w-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-secondary/20 p-3">
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sou Contratante</h3>
                <p className="text-sm text-muted-foreground">
                  Casa de show, bar, evento - encontre artistas
                </p>
              </div>
            </CardContent>
          </Card>
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {"Ja tem conta? "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}

interface RegisterFormProps {
  step: number
  setStep: (s: number) => void
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  isSubmitting: boolean
  setIsSubmitting: (v: boolean) => void
  router: ReturnType<typeof useRouter>
  onBack: () => void
}

function ArtistRegister({
  step,
  setStep,
  showPassword,
  setShowPassword,
  isSubmitting,
  setIsSubmitting,
  router,
  onBack,
}: RegisterFormProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
  } = useForm<ArtistForm>({
    resolver: zodResolver(artistSchema),
  })

  async function goNextStep() {
    const fields: (keyof ArtistForm)[] =
      step === 1 ? ["email", "password", "confirmPassword"] : ["stage_name", "cache_base", "city", "state"]
    const valid = await trigger(fields)
    if (valid) {
      // Validar se cidade foi selecionada
      if (step === 2 && !selectedCity) {
        toast.error("Selecione uma cidade da lista")
        return
      }
      setStep(step + 1)
    }
  }

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setValue("city", city.name, { shouldValidate: true })
    setValue("state", city.state, { shouldValidate: true })
  }

  async function onSubmit(data: ArtistForm) {
    setIsSubmitting(true)
    try {
      const genresList = data.genres
        ? data.genres.split(",").map((g) => g.trim()).filter(Boolean)
        : []
      
      await authService.signupArtist({
        email: data.email,
        password: data.password,
        stage_name: data.stage_name,
        bio: data.bio || "",
        cache_base: data.cache_base,
        city: data.city,
        state: data.state.toUpperCase(),
        ...(genresList.length > 0 && {
          genres: genresList,
          event_types: genresList,
          tags: genresList,
        }),
      })
      toast.success("Conta criada com sucesso! Faca login para continuar.")
      router.push("/login")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar conta"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 1 ? onBack : () => setStep(step - 1)}
              aria-label="Voltar ao passo anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-xl">Cadastro Artista</CardTitle>
              <CardDescription>Etapa {step} de 2</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" autoFocus {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimo 8 caracteres"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 z-10"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stage_name">Nome Artistico</Label>
                  <Input id="stage_name" placeholder="Ex: DJ Silva" {...register("stage_name")} />
                  {errors.stage_name && <p className="text-sm text-destructive">{errors.stage_name.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Fale sobre voce..." {...register("bio")} rows={3} />
                  {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="genres">Generos e tipos de evento (opcional)</Label>
                  <Input
                    id="genres"
                    placeholder="Open Format, 15 anos, Balada, Eletronica"
                    {...register("genres")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe por vírgula os estilos que você toca.
                  </p>
                  {errors.genres && <p className="text-sm text-destructive">{errors.genres.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cache_base">Cache Base (R$)</Label>
                  <Input id="cache_base" type="number" placeholder="500" {...register("cache_base")} />
                  {errors.cache_base && <p className="text-sm text-destructive">{errors.cache_base.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <CitySearch
                    value={selectedCity?.name || ""}
                    onCitySelect={handleCitySelect}
                    error={errors.city?.message}
                    label="Cidade (comece a digitar para buscar)"
                    placeholder="Digite o nome da cidade..."
                    required
                  />
                  {selectedCity && (
                    <p className="text-xs text-muted-foreground">
                      Estado: <strong>{selectedCity.state}</strong>
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {step === 1 ? (
              <Button
                type="button"
                className="w-full"
                onClick={goNextStep}
                disabled={isSubmitting}
                aria-label="Continuar para próximo passo do cadastro"
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                aria-label="Criar conta"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function VenueRegister({
  step,
  setStep,
  showPassword,
  setShowPassword,
  isSubmitting,
  setIsSubmitting,
  router,
  onBack,
}: RegisterFormProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
  } = useForm<VenueForm>({
    resolver: zodResolver(venueSchema),
  })

  async function goNextStep() {
    const fields: (keyof VenueForm)[] =
      step === 1 ? ["email", "password", "confirmPassword"] : ["venue_name", "capacity", "infrastructure", "city", "state"]
    const valid = await trigger(fields)
    if (valid) {
      // Validar se cidade foi selecionada
      if (step === 2 && !selectedCity) {
        toast.error("Selecione uma cidade da lista")
        return
      }
      setStep(step + 1)
    }
  }

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setValue("city", city.name, { shouldValidate: true })
    setValue("state", city.state, { shouldValidate: true })
  }

  async function onSubmit(data: VenueForm) {
    setIsSubmitting(true)
    try {
      await authService.signupVenue({
        email: data.email,
        password: data.password,
        venue_name: data.venue_name,
        capacity: data.capacity,
        infrastructure: data.infrastructure,
        city: data.city,
        state: data.state.toUpperCase(),
      })
      toast.success("Conta criada com sucesso! Faca login para continuar.")
      router.push("/login")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar conta"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 1 ? onBack : () => setStep(step - 1)}
              aria-label="Voltar ao passo anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-xl">Cadastro Contratante</CardTitle>
              <CardDescription>Etapa {step} de 2</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-secondary" : "bg-muted"}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-secondary" : "bg-muted"}`} />
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contratante@email.com" autoFocus {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimo 8 caracteres"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 z-10"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="venue_name">Nome da Casa de Show</Label>
                  <Input id="venue_name" placeholder="Ex: Casa Boemia" {...register("venue_name")} />
                  {errors.venue_name && <p className="text-sm text-destructive">{errors.venue_name.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input id="capacity" type="number" placeholder="200" {...register("capacity")} />
                  {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="infrastructure">Infraestrutura</Label>
                  <Input id="infrastructure" placeholder="Som, Luz, Palco..." {...register("infrastructure")} />
                  {errors.infrastructure && (
                    <p className="text-sm text-destructive">{errors.infrastructure.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <CitySearch
                    value={selectedCity?.name || ""}
                    onCitySelect={handleCitySelect}
                    error={!selectedCity ? errors.city?.message : undefined}
                    label="Cidade (comece a digitar para buscar)"
                    placeholder="Digite o nome da cidade..."
                    required
                  />
                  {selectedCity && (
                    <p className="text-xs text-muted-foreground">
                      Estado: <strong>{selectedCity.state}</strong>
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {step === 1 ? (
              <Button
                type="button"
                className="w-full"
                onClick={goNextStep}
                disabled={isSubmitting}
                aria-label="Continuar para próximo passo do cadastro"
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                aria-label="Criar conta"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
