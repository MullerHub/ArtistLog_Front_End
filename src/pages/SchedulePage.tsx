import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { InternalHeader } from "@/components/InternalHeader";
import { DAYS_OF_WEEK, type ScheduleSlot, type ScheduleSettings } from "@/types/artist";
import { schedulesService } from "@/services/schedules-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Calendar, Plus, Trash2, Clock, Settings, Lock } from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

export default function SchedulePage() {
  const { user } = useAuth();
  const isArtist = user?.role === "ARTIST" || !user; // allow in dev mode
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["schedule", "me"],
    queryFn: () => schedulesService.getMySchedule(),
    enabled: isArtist,
  });

  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings>({
    advance_booking_days: 30,
    min_slot_duration_hours: 2,
    auto_accept: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<ScheduleSlot> | null>(null);

  useEffect(() => {
    if (!data) return;
    setSlots(data.slots);
    setSettings(data.settings);
  }, [data]);

  const addSlotMutation = useMutation({
    mutationFn: (payload: { day_of_week: number; start_time: string; end_time: string }) => schedulesService.addSlot(payload, user!.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schedule", "me"] });
      toast.success("Slot adicionado!");
    },
    onError: () => {
      toast.error("Erro ao salvar slot. Verifique se o backend está rodando.");
      queryClient.invalidateQueries({ queryKey: ["schedule", "me"] });
    },
  });

  const removeSlotMutation = useMutation({
    mutationFn: (slotId: string) => schedulesService.removeSlot(slotId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schedule", "me"] });
      toast.success("Slot removido.");
    },
    onError: () => {
      toast.error("Erro ao remover slot.");
      queryClient.invalidateQueries({ queryKey: ["schedule", "me"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: { min_slot_duration_hours: number }) => schedulesService.updateSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schedule", "me"] });
    },
    onError: () => {
      toast.error("Erro ao salvar configurações.");
    },
  });

  if (!isArtist) {
    return (
      <>
        <InternalHeader title="Agenda" />
        <main className="flex-1 flex items-center justify-center p-6 grid-background">
          <div className="glass rounded-2xl p-8 text-center">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Acesso restrito</h2>
            <p className="text-sm text-muted-foreground">A gestão de agenda está disponível apenas para artistas.</p>
          </div>
        </main>
      </>
    );
  }

  const openNewSlot = (dayOfWeek?: number) => {
    setEditingSlot({
      day_of_week: dayOfWeek ?? 1,
      start_time: "09:00",
      end_time: "12:00",
      is_available: true,
      label: "",
    });
    setShowSlotDialog(true);
  };

  const openEditSlot = (slot: ScheduleSlot) => {
    setEditingSlot({ ...slot });
    setShowSlotDialog(true);
  };

  const saveSlot = () => {
    if (!editingSlot) return;
    if (editingSlot.start_time! >= editingSlot.end_time!) {
      toast.error("Horário de início deve ser antes do fim.");
      return;
    }

    if (editingSlot.id) {
      toast.info("Edição de slot: exclua e crie novamente.");
    } else {
      addSlotMutation.mutate({
        day_of_week: editingSlot.day_of_week!,
        start_time: editingSlot.start_time!,
        end_time: editingSlot.end_time!,
      });
    }
    setShowSlotDialog(false);
    setEditingSlot(null);
  };

  const deleteSlot = (id: string) => {
    removeSlotMutation.mutate(id);
  };

  return (
    <>
      <InternalHeader title="Minha Agenda" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Actions bar */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Disponibilidade semanal</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-1" /> Config
                </Button>
                <Button size="sm" onClick={() => openNewSlot()}>
                  <Plus className="h-4 w-4 mr-1" /> Novo slot
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Weekly grid */}
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="glass rounded-xl p-4 overflow-x-auto">
              {isLoading && <p className="text-sm text-muted-foreground mb-3">Carregando agenda...</p>}
              <div className="grid grid-cols-7 gap-2 min-w-[600px]">
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const daySlots = slots.filter((s) => s.day_of_week === dayIndex);
                  return (
                    <div key={dayIndex} className="min-h-[180px]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-heading font-semibold text-foreground">{day.slice(0, 3)}</p>
                        <button
                          onClick={() => openNewSlot(dayIndex)}
                          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {daySlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => openEditSlot(slot)}
                            className={`w-full rounded-lg px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              slot.is_available
                                ? "bg-success/10 border border-success/20 hover:bg-success/20"
                                : "bg-destructive/10 border border-destructive/20 hover:bg-destructive/20"
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <Clock className={`h-3 w-3 ${slot.is_available ? "text-success" : "text-destructive"}`} />
                              <span className={`text-[10px] font-medium ${slot.is_available ? "text-success" : "text-destructive"}`}>
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                            {slot.label && (
                              <p className="text-[10px] text-muted-foreground truncate">{slot.label}</p>
                            )}
                          </button>
                        ))}
                        {daySlots.length === 0 && (
                          <div className="rounded-lg border border-dashed border-border/40 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground">Sem horários</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-success/20 border border-success/30" />
                Disponível
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-destructive/20 border border-destructive/30" />
                Reservado / Indisponível
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Slot Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingSlot?.id ? "Editar slot" : "Novo slot"}
            </DialogTitle>
          </DialogHeader>

          {editingSlot && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Dia da semana</Label>
                <Select
                  value={String(editingSlot.day_of_week)}
                  onValueChange={(v) => setEditingSlot((s) => ({ ...s!, day_of_week: Number(v) }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Início</Label>
                  <Select
                    value={editingSlot.start_time}
                    onValueChange={(v) => setEditingSlot((s) => ({ ...s!, start_time: v }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Fim</Label>
                  <Select
                    value={editingSlot.end_time}
                    onValueChange={(v) => setEditingSlot((s) => ({ ...s!, end_time: v }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Rótulo (opcional)</Label>
                <Input
                  className="mt-1"
                  placeholder="Ex: Manhã, Noite livre..."
                  value={editingSlot.label || ""}
                  onChange={(e) => setEditingSlot((s) => ({ ...s!, label: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingSlot.is_available}
                  onCheckedChange={(v) => setEditingSlot((s) => ({ ...s!, is_available: v }))}
                />
                <Label className="text-sm">Disponível para booking</Label>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {editingSlot?.id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteSlot(editingSlot.id!);
                  setShowSlotDialog(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setShowSlotDialog(false)}>Cancelar</Button>
            <Button onClick={saveSlot}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">Configurações da Agenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Antecedência máxima para booking (dias)</Label>
              <Input
                type="number"
                className="mt-1"
                value={settings.advance_booking_days}
                onChange={(e) => setSettings((s) => ({ ...s, advance_booking_days: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs">Duração mínima do evento (horas)</Label>
              <Input
                type="number"
                className="mt-1"
                value={settings.min_slot_duration_hours}
                onChange={(e) => setSettings((s) => ({ ...s, min_slot_duration_hours: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.auto_accept}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, auto_accept: v }))}
              />
              <Label className="text-sm">Aceitar propostas automaticamente</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Fechar</Button>
            <Button
              onClick={() => {
                updateSettingsMutation.mutate({ min_slot_duration_hours: settings.min_slot_duration_hours });
                setShowSettings(false);
                toast.success("Configuracoes salvas!");
              }}
              disabled={updateSettingsMutation.isPending}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
