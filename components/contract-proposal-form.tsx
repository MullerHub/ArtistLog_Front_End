"use client"

import { useState } from "react"
import { CalendarIcon, DollarSign, Send, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { contractsService } from "@/lib/services/contracts.service"
import { toast } from "sonner"
import { mutate } from "swr"

const CONTRACT_TAGS = [
  { id: "transport", label: "Transporte incluso" },
  { id: "effects", label: "Efeitos de palco incluso" },
  { id: "lodging", label: "Hospedagem inclusa" },
  { id: "meals", label: "Refeições incluídas" },
  { id: "equipment", label: "Equipamento fornecido" },
  { id: "crew", label: "Equipe técnica inclusa" },
]

interface ContractProposalFormProps {
  artistId: string
  artistName?: string
  venueId: string
  venueName?: string
  mode: "artist-to-venue" | "venue-to-artist"
}

export function ContractProposalForm({ 
  artistId, 
  artistName, 
  venueId, 
  venueName,
  mode 
}: ContractProposalFormProps) {
  const [open, setOpen] = useState(false)
  const [eventDate, setEventDate] = useState("")
  const [finalPrice, setFinalPrice] = useState("")
  const [details, setDetails] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const targetName = mode === "artist-to-venue" ? venueName : artistName
  const title = mode === "artist-to-venue" 
    ? `Enviar Proposta de Contrato`
    : `Contratar Artista`
  const description = mode === "artist-to-venue"
    ? `Proponha um show para ${targetName}`
    : `Envie uma proposta para ${targetName}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const tagsString = selectedTags.length > 0 
        ? selectedTags.map(tagId => {
            const tag = CONTRACT_TAGS.find(t => t.id === tagId)
            return tag?.label || tagId
          }).join(", ")
        : undefined

      await contractsService.create({
        artist_id: artistId,
        venue_id: venueId,
        event_date: eventDate,
        final_price: parseFloat(finalPrice),
        details: details || undefined,
        tags: tagsString,
      })

      toast.success("Proposta enviada com sucesso!")
      setOpen(false)
      setEventDate("")
      setFinalPrice("")
      setDetails("")
      setSelectedTags([])

      // Revalidar lista de contratos
      mutate("/contracts")
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Erro ao enviar proposta: ${error.message}`)
      } else {
        toast.error("Erro ao enviar proposta")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // Obter data mínima (hoje)
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Send className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg" aria-label="Abrir formulário de proposta de contrato">
              <Send className="mr-2 h-4 w-4" />
              Enviar Proposta
            </Button>
          </DialogTrigger>
          <DialogContent hiddenTitle={false}>
            <DialogHeader>
              <DialogTitle>Nova Proposta para {targetName}</DialogTitle>
              <DialogDescription>
                {mode === "artist-to-venue" 
                  ? "Preencha os detalhes da sua proposta de show. A Local receberá e poderá aceitar ou recusar."
                  : "Defina a data e valor para contratar este artista."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Data do Evento</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="event_date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    min={today}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="final_price">Valor Proposto (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="final_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {mode === "artist-to-venue"
                    ? "Este é o valor do seu cachê para a apresentação"
                    : "Valor total a ser pago pelo show"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Detalhes Adicionais</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={mode === "artist-to-venue"
                    ? "Ex: Duração do show, repertório, necessidades técnicas, etc."
                    : "Ex: Requisitos especiais, estrutura do palco, infraestrutura, etc."}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Inclua informações importantes sobre o show
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Condições Especiais (selecione quantas desejar)
                </Label>
                <div className="grid grid-cols-1 gap-3 bg-muted/30 p-3 rounded-md">
                  {CONTRACT_TAGS.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-2">
                      <Checkbox
                        id={tag.id}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <label
                        htmlFor={tag.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tag.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} aria-label="Cancelar envio de proposta">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} aria-label={isSubmitting ? "Enviando proposta" : "Enviar proposta de contrato"}>
                  {isSubmitting ? "Enviando..." : "Enviar Proposta"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <p className="mt-3 text-xs text-muted-foreground">
          {mode === "artist-to-venue"
            ? "O Contratante receberá sua proposta e poderá aceitar, recusar ou negociar os valores"
            : "O artista receberá sua proposta e poderá aceitar ou recusar"}
        </p>
      </CardContent>
    </Card>
  )
}
