"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FormErrorsAlert } from "@/components/form-errors-alert"
import { venuesService } from "@/lib/services/venues.service"
import { CitySearch } from "@/components/CitySearch"

interface CommunityVenueFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CommunityVenueForm({ onSuccess, onCancel }: CommunityVenueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [formData, setFormData] = useState({
    venue_name: "",
    description: "",
    capacity: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    infrastructure: "",
    phone: "",
    website: "",
    is_anonymous: false,
  })

  const handleCitySelect = (city: { name: string; state: string; latitude: number; longitude: number }) => {
    setFormData(prev => ({
      ...prev,
      city: city.name,
      state: city.state,
      latitude: city.latitude.toString(),
      longitude: city.longitude.toString(),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    try {
      // Validation
      const validationErrors: string[] = []
      
      if (!formData.venue_name.trim()) {
        validationErrors.push("Nome da casa de show é obrigatório")
      }
      
      if (!formData.capacity || parseInt(formData.capacity) <= 0) {
        validationErrors.push("Capacidade deve ser um número maior que zero")
      }
      
      if (!formData.city || !formData.state) {
        validationErrors.push("Selecione uma cidade válida")
      }

      if (!formData.latitude || !formData.longitude) {
        validationErrors.push("Coordenadas geográficas são obrigatórias. Selecione uma cidade.")
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setIsSubmitting(false)
        return
      }

      // Submit
      await venuesService.createCommunityVenue({
        venue_name: formData.venue_name.trim(),
        description: formData.description.trim() || undefined,
        capacity: parseInt(formData.capacity),
        city: formData.city,
        state: formData.state,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        infrastructure: formData.infrastructure.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        is_anonymous: formData.is_anonymous,
      })

      // Success
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        setErrors([error.message as string])
      } else {
        setErrors(["Erro ao cadastrar casa de show. Tente novamente."])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Adicionar Casa de Show</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre um local onde você já se apresentou ou conhece. Outros artistas poderão ver
          este local. O proprietário poderá reivindicar a gestão posteriormente.
        </p>
      </div>

      {errors.length > 0 && <FormErrorsAlert errors={errors} />}

      <div className="space-y-4">
        {/* Nome do Venue */}
        <div className="space-y-2">
          <Label htmlFor="venue_name">
            Nome da Casa de Show <span className="text-red-500">*</span>
          </Label>
          <Input
            id="venue_name"
            value={formData.venue_name}
            onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
            placeholder="Ex: Bar do João, Café Cultural, etc."
            required
          />
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <CitySearch onCitySelect={handleCitySelect} />
          {formData.city && (
            <p className="text-sm text-muted-foreground">
              ✓ {formData.city} - {formData.state}
            </p>
          )}
        </div>

        {/* Capacidade */}
        <div className="space-y-2">
          <Label htmlFor="capacity">
            Capacidade (pessoas) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
            placeholder="Ex: 50, 100, 200..."
            required
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva o local, tipo de evento, ambiente, etc."
            rows={4}
          />
        </div>

        {/* Infraestrutura */}
        <div className="space-y-2">
          <Label htmlFor="infrastructure">Infraestrutura</Label>
          <Textarea
            id="infrastructure"
            value={formData.infrastructure}
            onChange={(e) => setFormData(prev => ({ ...prev, infrastructure: e.target.value }))}
            placeholder="Ex: Som próprio, camarim, estacionamento, etc."
            rows={3}
          />
        </div>

        {/* Telefone/WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone/WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Ex: (51) 99999-9999"
          />
          <p className="text-xs text-muted-foreground">
            Número de contato do estabelecimento (caso saiba)
          </p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website/Instagram</Label>
          <Input
            id="website"
            type="text"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="Ex: https://instagram.com/casadorock ou https://exemplo.com"
          />
          <p className="text-xs text-muted-foreground">
            Link para rede social ou site oficial
          </p>
        </div>

        {/* Anônimo */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_anonymous"
            checked={formData.is_anonymous}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, is_anonymous: checked === true }))
            }
          />
          <Label htmlFor="is_anonymous" className="text-sm font-normal cursor-pointer">
            Criar anonimamente (seu nome não será vinculado a esta casa de show)
          </Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Cadastrando..." : "Adicionar Casa de Show"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
