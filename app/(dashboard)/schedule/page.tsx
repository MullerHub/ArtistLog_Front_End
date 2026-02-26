'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleSlots as slotsApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ScheduleSlot } from '@/types';

function formatMonthYear(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function SchedulePage() {
  const qc = useQueryClient();
  const user = getUser();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  // New slot form
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['schedule-slots'],
    queryFn: slotsApi.getScheduleSlots,
  });

  // Filter slots to current viewed month
  const monthSlots = slots.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  const sortedSlots = [...monthSlots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const createSlot = useMutation({
    mutationFn: (data: Omit<ScheduleSlot, 'id'>) => slotsApi.createScheduleSlot(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule-slots'] });
      setNewDate('');
      setNewNotes('');
      setFormError('');
    },
    onError: () => setFormError('Falha ao adicionar slot. Tente novamente.'),
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      slotsApi.updateScheduleSlot(id, { available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule-slots'] }),
  });

  const deleteSlot = useMutation({
    mutationFn: (id: string) => slotsApi.deleteScheduleSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule-slots'] }),
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setFormError('Data é obrigatória.');
      return;
    }
    setFormError('');
    createSlot.mutate({ artist_id: user?.id ?? '', date: newDate, available: true, notes: newNotes || undefined });
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Agenda</h1>

      {/* Add slot form */}
      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardContent className="pt-6">
          <form onSubmit={handleAddSlot} className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[var(--card-foreground)]">Adicionar Slot</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="slot_date">Data *</Label>
                <Input
                  id="slot_date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="slot_notes">Observações</Label>
                <Textarea
                  id="slot_notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Observações opcionais…"
                />
              </div>
            </div>
            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}
            <Button
              type="submit"
              disabled={createSlot.isPending}
              className="self-start bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
            >
              {createSlot.isPending ? 'Adicionando…' : 'Adicionar Slot'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Month navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={prevMonth} aria-label="Mês anterior">
          ←
        </Button>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {formatMonthYear(viewYear, viewMonth)}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMonth} aria-label="Próximo mês">
          →
        </Button>
      </div>

      {/* Slots list */}
      {isLoading ? (
        <p className="text-[var(--muted-foreground)]">Carregando agenda…</p>
      ) : sortedSlots.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">Nenhum slot para este mês.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedSlots.map((slot) => (
            <Card
              key={slot.id}
              className={[
                'border-[var(--border)]',
                slot.available ? 'bg-green-50' : 'bg-[var(--card)]',
              ].join(' ')}
            >
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium text-[var(--foreground)]">
                    {new Date(slot.date).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  {slot.notes && (
                    <p className="text-sm text-[var(--muted-foreground)]">{slot.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={[
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      slot.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700',
                    ].join(' ')}
                  >
                    {slot.available ? 'Disponível' : 'Indisponível'}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={toggleAvailability.isPending}
                    onClick={() =>
                      toggleAvailability.mutate({ id: slot.id, available: !slot.available })
                    }
                    aria-label={slot.available ? 'Marcar como indisponível' : 'Marcar como disponível'}
                  >
                    Alternar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteSlot.isPending}
                    onClick={() => deleteSlot.mutate(slot.id)}
                    aria-label="Excluir slot"
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
