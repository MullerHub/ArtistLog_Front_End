'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { communityVenues as communityVenuesApi } from '@/lib/api';
import { CitySearch } from '@/components/common/CitySearch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CommunityVenue } from '@/types';

const INFRASTRUCTURE_OPTIONS = ['Palco', 'Sistema de PA', 'Iluminação', 'Camarim', 'Estacionamento'];

export interface CommunityVenueFormProps {
  onSuccess?: (venue: CommunityVenue) => void;
}

export function CommunityVenueForm({ onSuccess }: CommunityVenueFormProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [infrastructure, setInfrastructure] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleInfrastructure = (item: string) => {
    setInfrastructure((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório.';
    if (!city.trim()) errs.city = 'Cidade é obrigatória.';
    return errs;
  };

  const createVenue = useMutation({
    mutationFn: (data: Omit<CommunityVenue, 'id' | 'status' | 'created_at'>) =>
      communityVenuesApi.createCommunityVenue(data),
    onSuccess: (venue) => {
      onSuccess?.(venue);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    createVenue.mutate({
      name: name.trim(),
      city: city.trim(),
      state: state.trim(),
      capacity: parseInt(capacity, 10) || 0,
      description: description.trim(),
      is_anonymous: isAnonymous,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Name */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cv_name">Nome do Venue *</Label>
        <Input
          id="cv_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex.: Casa do Rock"
          aria-describedby={errors.name ? 'cv-name-error' : undefined}
          aria-required
        />
        {errors.name && (
          <p id="cv-name-error" role="alert" className="text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* City */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cv_city">Cidade *</Label>
        <CitySearch
          value={city}
          onChange={setCity}
          onCitySelect={(cityName) => {
            const parts = cityName.split(', ');
            setCity(parts[0] ?? cityName);
            setState(parts[1] ?? '');
          }}
          placeholder="Buscar cidade…"
        />
        {errors.city && (
          <p role="alert" className="text-xs text-red-600">
            {errors.city}
          </p>
        )}
      </div>

      {/* State */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cv_state">Estado</Label>
        <Input
          id="cv_state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="ex.: SP"
        />
      </div>

      {/* Capacity */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cv_capacity">Capacidade</Label>
        <Input
          id="cv_capacity"
          type="number"
          min="0"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="ex.: 150"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="cv_description">Descrição</Label>
        <Textarea
          id="cv_description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Breve descrição do venue…"
        />
      </div>

      {/* Infrastructure */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--foreground)]">
          Infraestrutura
        </legend>
        <div className="flex flex-wrap gap-4">
          {INFRASTRUCTURE_OPTIONS.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Checkbox
                id={`cv_infra_${item}`}
                checked={infrastructure.includes(item)}
                onCheckedChange={() => toggleInfrastructure(item)}
              />
              <Label htmlFor={`cv_infra_${item}`} className="cursor-pointer">
                {item}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Anonymous */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="cv_anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(Boolean(checked))}
        />
        <Label htmlFor="cv_anonymous" className="cursor-pointer">
          Enviar anonimamente
        </Label>
      </div>

      {createVenue.isError && (
        <p role="alert" className="text-sm text-red-600">
          Falha ao criar venue. Tente novamente.
        </p>
      )}

      <Button
        type="submit"
        disabled={createVenue.isPending}
        className="self-start bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
      >
        {createVenue.isPending ? 'Criando…' : 'Criar Venue'}
      </Button>
    </form>
  );
}
