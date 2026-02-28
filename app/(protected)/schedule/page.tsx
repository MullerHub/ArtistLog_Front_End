"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Calendar,
  Plus,
  Trash2,
  Loader2,
  Clock,
  Settings2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { schedulesService } from "@/lib/services/schedules.service"
import { ApiError } from "@/lib/api-client"
import { formatDayOfWeek } from "@/lib/formatters"
import { toast } from "sonner"
import type { ScheduleResponse } from "@/lib/types"

const slotSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM obrigatório"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM obrigatório"),
  crosses_midnight: z.boolean().default(false), // true se horário passa da meia-noite
}).refine(
  (data) => {
    // Converte para minutos desde meia-noite para comparação
    const [startHour, startMin] = data.start_time.split(':').map(Number)
    const [endHour, endMin] = data.end_time.split(':').map(Number)
    
    const startTotalMins = startHour * 60 + startMin
    const endTotalMins = endHour * 60 + endMin
    
    // Se crosses_midnight é true, end_time deve ser menor que start_time (ex: 23:00 e 01:00)
    if (data.crosses_midnight) {
      return endTotalMins < startTotalMins
    }
    
    // Se no mesmo dia, end_time deve ser depois de start_time
    return endTotalMins > startTotalMins && endTotalMins - startTotalMins >= 15 // mínimo 15 minutos
  },
  {
    message: "Horário fim deve ser depois do inicio (mínimo 15 min) ou marcar 'passa meia-noite'",
    path: ["end_time"],
  }
)

type SlotForm = z.infer<typeof slotSchema>

const createScheduleSchema = z.object({
  min_gig_duration: z.coerce.number().min(30, "Minimo 30 minutos"),
  notes: z.string().max(500).optional(),
})

type CreateScheduleForm = z.infer<typeof createScheduleSchema>

const updateScheduleSchema = z.object({
  min_gig_duration: z.coerce.number().min(30, "Minimo 30 minutos"),
  notes: z.string().max(500).optional(),
  preferred_event_types: z.string().max(300).optional(),
})

type UpdateScheduleForm = z.infer<typeof updateScheduleSchema>

const parseCommaList = (value?: string) => {
  if (!value) return []
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const getScheduleErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof ApiError) {
    if (err.status === 400) return "Dados inválidos. Revise horários e duração mínima."
    if (err.status === 401) return "Sua sessão expirou. Faça login novamente."
    if (err.status === 404) return "Agenda não encontrada. Crie uma nova agenda."
    if (err.status === 409) return "Conflito de horário. Ajuste os slots e tente de novo."
    return err.message || fallback
  }

  if (err instanceof Error) return err.message

  return fallback
}

export default function SchedulePage() {
  const { user } = useAuth()

  const { data: schedule, isLoading, error } = useSWR<ScheduleResponse>(
    user?.role === "ARTIST" ? "my-schedule" : null,
    () => schedulesService.getMySchedule(),
    { revalidateOnFocus: false }
  )

  if (user?.role !== "ARTIST") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Apenas artistas podem gerenciar agendas
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !schedule) {
    return <CreateSchedulePrompt />
  }

  if (!schedule) {
    return <CreateSchedulePrompt />
  }

  return <ScheduleManager schedule={schedule} />
}

function CreateSchedulePrompt() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateScheduleForm>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: { min_gig_duration: 120 },
  })

  async function onSubmit(data: CreateScheduleForm) {
    if (!user) return
    setIsSubmitting(true)
    try {
      await schedulesService.createSchedule(user.id, {
        min_gig_duration: data.min_gig_duration,
        notes: data.notes || undefined,
      })
      toast.success("Agenda criada com sucesso!")
      setOpen(false)
      mutate("my-schedule")
    } catch (err: unknown) {
      const message = getScheduleErrorMessage(err, "Erro ao criar agenda")
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 rounded-xl bg-primary/10 p-4">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Criar sua Agenda</CardTitle>
          <CardDescription>
            Configure sua agenda para que venues possam ver seus horarios disponiveis
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
            <p className="font-medium mb-2">💡 Dicas para sua agenda:</p>
            <ul className="space-y-1 text-xs">
              <li>• Cada horário precisa ter no mínimo 15 minutos de duração</li>
              <li>• Shows que vão além da meia-noite? Marque a opção ao adicionar o horário</li>
              <li>• Você pode organizar horários diferentes para cada dia da semana</li>
            </ul>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Criar Agenda</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Agenda</DialogTitle>
                <DialogDescription>
                  Defina a duração mínima e observações iniciais da sua agenda.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="min_gig_duration">Duracao minima do show (minutos)</Label>
                    <Input
                      id="min_gig_duration"
                      type="number"
                      {...register("min_gig_duration")}
                    />
                    {errors.min_gig_duration && (
                      <p className="text-sm text-destructive">{errors.min_gig_duration.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="notes">Observacoes</Label>
                    <Textarea id="notes" placeholder="Ex: Disponivel fins de semana" {...register("notes")} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

function ScheduleManager({ schedule }: { schedule: ScheduleResponse }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SlotForm>({
    resolver: zodResolver(slotSchema),
    defaultValues: { day_of_week: 0, start_time: "21:00", end_time: "23:00", crosses_midnight: false },
  })

  const crossesMidnight = watch("crosses_midnight")

  const {
    register: registerSchedule,
    handleSubmit: handleSubmitSchedule,
    formState: { errors: scheduleErrors },
  } = useForm<UpdateScheduleForm>({
    resolver: zodResolver(updateScheduleSchema),
    defaultValues: {
      min_gig_duration: schedule.min_gig_duration,
      notes: schedule.notes || "",
      preferred_event_types: (schedule.preferred_event_types || []).join(", "),
    },
  })

  async function onUpdateSchedule(data: UpdateScheduleForm) {
    setIsUpdatingSettings(true)
    try {
      const preferredEventTypes = parseCommaList(data.preferred_event_types)

      await schedulesService.updateSchedule({
        min_gig_duration: data.min_gig_duration,
        notes: data.notes || undefined,
        preferred_event_types: preferredEventTypes.length > 0 ? preferredEventTypes : undefined,
      })

      toast.success("Configurações da agenda atualizadas!")
      mutate("my-schedule")
    } catch (err: unknown) {
      const message = getScheduleErrorMessage(err, "Erro ao atualizar agenda")
      toast.error(message)
    } finally {
      setIsUpdatingSettings(false)
    }
  }

  async function onAddSlot(data: SlotForm) {
    setIsAdding(true)
    try {
      await schedulesService.addSlot({
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        crosses_midnight: data.crosses_midnight, // Novo campo
      })
      toast.success("Horario adicionado com sucesso!")
      setAddDialogOpen(false)
      reset()
      mutate("my-schedule")
    } catch (err: unknown) {
      const message = getScheduleErrorMessage(err, "Erro ao adicionar horario")
      toast.error(message)
    } finally {
      setIsAdding(false)
    }
  }

  async function onDeleteSlot(slotId: string) {
    setDeletingSlotId(slotId)
    try {
      await schedulesService.removeSlot(slotId)
      toast.success("Horario removido!")
      mutate("my-schedule")
    } catch (err: unknown) {
      const message = getScheduleErrorMessage(err, "Erro ao remover horario")
      toast.error(message)
    } finally {
      setDeletingSlotId(null)
    }
  }

  const slotsByDay = (schedule.slots || []).reduce(
    (acc, slot) => {
      const day = slot.day_of_week
      if (!acc[day]) acc[day] = []
      acc[day].push(slot)
      return acc
    },
    {} as Record<number, typeof schedule.slots>
  )

  const weekdayOrder = [0, 1, 2, 3, 4, 5, 6]

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minha Agenda</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus horarios disponiveis
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Horario
            </Button>
          </DialogTrigger>
          <DialogContent hiddenTitle={false}>
            <DialogHeader>
              <DialogTitle>Novo Horario Disponivel</DialogTitle>
              <DialogDescription>
                Adicione um dia e horario em que voce esta disponivel para shows
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onAddSlot)}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label>Dia da Semana</Label>
                  <Select
                    defaultValue="0"
                    onValueChange={(v) => setValue("day_of_week", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {formatDayOfWeek(d)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-1 flex-col gap-2">
                    <Label htmlFor="start_time">Inicio</Label>
                    <Input id="start_time" type="time" placeholder="21:00" {...register("start_time")} />
                    {errors.start_time && (
                      <p className="text-sm text-destructive">{errors.start_time.message}</p>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <Label htmlFor="end_time">Fim {crossesMidnight && "(madrugada)"}</Label>
                    <Input id="end_time" type="time" placeholder="23:00" {...register("end_time")} />
                    {errors.end_time && (
                      <p className="text-sm text-destructive">{errors.end_time.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Checkbox para eventos que passam meia-noite */}
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                  <input
                    type="checkbox"
                    id="crosses_midnight"
                    {...register("crosses_midnight")}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <Label htmlFor="crosses_midnight" className="flex-1 cursor-pointer text-sm">
                    🌙 Este horário vai até o dia seguinte?
                    <span className="block text-xs text-muted-foreground">
                      Ex: Show das 22h até 2h da manhã do próximo dia
                    </span>
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Configurações da Agenda</CardTitle>
          <CardDescription>
            Configure os detalhes gerais da sua disponibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitSchedule(onUpdateSchedule)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="schedule-min-duration">Duração mínima (min)</Label>
                <Input
                  id="schedule-min-duration"
                  type="number"
                  {...registerSchedule("min_gig_duration")}
                />
                {scheduleErrors.min_gig_duration && (
                  <p className="text-sm text-destructive">{scheduleErrors.min_gig_duration.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="schedule-event-types">Tipos de evento preferidos</Label>
                <Input
                  id="schedule-event-types"
                  placeholder="Casamento, Corporativo, Festival"
                  {...registerSchedule("preferred_event_types")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="schedule-notes">Observações</Label>
              <Textarea
                id="schedule-notes"
                placeholder="Ex: aceito sets após 22h e deslocamento até 30km"
                {...registerSchedule("notes")}
              />
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
              <p className="font-medium mb-1">ℹ️ Sobre horários</p>
              <p>Configure a duração mínima que você aceita para shows e adicione observações úteis para os contratantes (ex: aceita deslocamento, equipamentos disponíveis, etc).</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingSettings}>
                {isUpdatingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Schedule Info */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duracao minima:</span>
            <Badge variant="outline">{schedule.min_gig_duration} min</Badge>
          </div>
          {schedule.notes && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Notas:</span>
              <span className="text-foreground">{schedule.notes}</span>
            </div>
          )}
          {schedule.preferred_event_types && schedule.preferred_event_types.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Preferências:</span>
              {schedule.preferred_event_types.map((eventType) => (
                <Badge key={eventType} variant="outline">{eventType}</Badge>
              ))}
            </div>
          )}
          <Badge variant={schedule.is_active ? "default" : "secondary"}>
            {schedule.is_active ? "Ativa" : "Inativa"}
          </Badge>
        </CardContent>
      </Card>

      {/* Availability Grid */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Resumo Semanal</CardTitle>
          <CardDescription>Quantidade de horários disponíveis por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {weekdayOrder.map((day) => {
              const slots = slotsByDay[day] || []
              return (
                <div key={day} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs font-semibold text-foreground">{formatDayOfWeek(day)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {slots.length} slot{slots.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Slots by Day */}
      {(!schedule.slots || schedule.slots.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <Clock className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhum horario cadastrado. Adicione seu primeiro horario disponivel.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {weekdayOrder.map((day) => {
            const slots = slotsByDay[day]
            if (!slots || slots.length === 0) return null
            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{formatDayOfWeek(day)}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {slot.start_time} - {slot.end_time}
                          {slot.crosses_midnight && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                              🌙 madrugada
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={slot.is_booked ? "secondary" : "outline"}
                          className={!slot.is_booked ? "border-[hsl(var(--success))] text-[hsl(var(--success))]" : ""}
                        >
                          {slot.is_booked ? "Reservado" : "Livre"}
                        </Badge>
                        {!slot.is_booked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteSlot(slot.id)}
                            disabled={deletingSlotId === slot.id}
                          >
                            {deletingSlotId === slot.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
