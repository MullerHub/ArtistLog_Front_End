"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { venuesService } from "@/lib/services/venues.service"
import { CitySearch } from "@/components/CitySearch"
import { FormErrorsAlert } from "@/components/form-errors-alert"
import { useRouter } from "next/navigation"

interface ClaimCandidate {
  id: string
  venue_name: string
  description: string | null
  capacity: number
  city: string
  state: string
  distance_km: number
  is_anonymous: boolean
  created_by_user_id: string | null
  created_at: string
}

export default function ClaimVenuePage() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)
  const [candidates, setCandidates] = useState<ClaimCandidate[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [claimingId, setClaimingId] = useState<string | null>(null)
  
  const [searchParams, setSearchParams] = useState({
    venue_name: "",
    city: "",
    state: "",
    lat: "",
    lon: "",
    distance: "10",
  })

  const handleCitySelect = (city: { name: string; state: string; lat: number; lon: number }) => {
    setSearchParams(prev => ({
      ...prev,
      city: city.name,
      state: city.state,
      lat: city.lat.toString(),
      lon: city.lon.toString(),
    }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsSearching(true)

    try {
      if (!searchParams.venue_name.trim()) {
        setErrors(["Digite o nome do local para buscar"])
        setIsSearching(false)
        return
      }

      if (!searchParams.lat || !searchParams.lon) {
        setErrors(["Selecione uma cidade para Buscar Locais próximos"])
        setIsSearching(false)
        return
      }

      const results = await venuesService.getClaimCandidates({
        venue_name: searchParams.venue_name.trim(),
        lat: parseFloat(searchParams.lat),
        lon: parseFloat(searchParams.lon),
        distance: parseInt(searchParams.distance) || 10,
      })

      setCandidates(results)
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        setErrors([error.message as string])
      } else {
        setErrors(["Erro ao Buscar Locais. Tente novamente."])
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleClaim = async (venueId: string) => {
    if (!confirm("Tem certeza que deseja Reivindicar este local? Esta ação não pode ser desfeita.")) {
      return
    }

    setClaimingId(venueId)
    setErrors([])

    try {
      await venuesService.claimCommunityVenue(venueId)
      alert("✅ Local reivindicado com sucesso! Redirecionando para o perfil da casa de show...")
      router.push(`/venues/${venueId}`)
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        setErrors([error.message as string])
      } else {
        setErrors(["Erro ao reivindicar casa de show. Tente novamente."])
      }
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reivindicar Minha Casa de Show</h1>
        <p className="text-muted-foreground">
          Busque por casas de show cadastradas por artistas e reivindique a propriedade do seu estabelecimento.
        </p>
      </div>

      {errors.length > 0 && <FormErrorsAlert errors={errors} />}

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Meu Local</CardTitle>
          <CardDescription>
            Digite o nome do seu estabelecimento e selecione a cidade para encontrar candidatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue_name">Nome do Local</Label>
              <Input
                id="venue_name"
                value={searchParams.venue_name}
                onChange={(e) => setSearchParams(prev => ({ ...prev, venue_name: e.target.value }))}
                placeholder="Ex: Bar do João"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <CitySearch onCitySelect={handleCitySelect} />
              {searchParams.city && (
                <p className="text-sm text-muted-foreground">
                  ✓ {searchParams.city} - {searchParams.state}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distância Máxima (km)</Label>
              <Input
                id="distance"
                type="number"
                min="1"
                max="100"
                value={searchParams.distance}
                onChange={(e) => setSearchParams(prev => ({ ...prev, distance: e.target.value }))}
              />
            </div>

            <Button type="submit" disabled={isSearching} className="w-full" aria-label="Buscar locais pelo nome e cidade">
              {isSearching ? "Buscando..." : "Buscar Locais"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {candidates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Candidatos Encontrados ({candidates.length})</h2>
          
          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{candidate.venue_name}</CardTitle>
                      <CardDescription>
                        {candidate.city} - {candidate.state} • {candidate.distance_km.toFixed(1)} km de distância
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleClaim(candidate.id)}
                      disabled={claimingId !== null}
                      size="sm"
                    aria-label={`Reivindicar propriedade do local ${candidate.venue_name}`}
                    >
                      {claimingId === candidate.id ? "Reivindicando..." : "Reivindicar"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {candidate.description && (
                    <div>
                      <p className="text-sm font-medium">Descrição:</p>
                      <p className="text-sm text-muted-foreground">{candidate.description}</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    <span>
                      <strong>Capacidade:</strong> {candidate.capacity} pessoas
                    </span>
                    <span>
                      <strong>Criado em:</strong> {new Date(candidate.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {candidate.is_anonymous && (
                    <p className="text-xs text-muted-foreground italic">
                      Criado anonimamente por um artista
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {candidates.length === 0 && !isSearching && searchParams.venue_name && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Nenhum local encontrado com este nome nesta região.
              <br />
              Tente ajustar o nome ou aumentar a distância.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
