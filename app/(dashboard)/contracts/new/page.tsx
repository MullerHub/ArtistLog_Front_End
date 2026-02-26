'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getUser } from '@/lib/auth';
import { contracts as contractsApi, artists, venues } from '@/lib/api';
import { CitySearch } from '@/components/common/CitySearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ArtistProfile, VenueProfile, Contract } from '@/types';

const CONTRACT_TAGS = ['Transport', 'Effects', 'Lodging', 'Meals', 'Equipment', 'Crew'];
const CONTRACT_TAG_LABELS: Record<string, string> = {
  Transport: 'Transporte',
  Effects: 'Efeitos',
  Lodging: 'Hospedagem',
  Meals: 'Refeições',
  Equipment: 'Equipamentos',
  Crew: 'Equipe',
};

export default function NewContractPage() {
  const router = useRouter();
  const user = getUser();
  const role = user?.role;

  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [searchName, setSearchName] = useState('');

  // Contract fields
  const [selectedId, setSelectedId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [value, setValue] = useState('');
  const [details, setDetails] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Search results
  const { data: artistResults = [] } = useQuery<ArtistProfile[]>({
    queryKey: ['artist-search', searchCity],
    queryFn: () => artists.searchArtists(searchCity),
    enabled: role === 'VENUE' && searchCity.length > 1,
  });

  const { data: venueResults = [] } = useQuery<VenueProfile[]>({
    queryKey: ['venue-search', searchCity],
    queryFn: () => venues.searchVenues(searchCity),
    enabled: role === 'ARTIST' && searchCity.length > 1,
  });

  const results: (ArtistProfile | VenueProfile)[] = role === 'VENUE' ? artistResults : venueResults;

  const filteredResults = searchName
    ? results.filter((r) => {
        const name =
          'stage_name' in r ? r.stage_name : r.venue_name;
        return name.toLowerCase().includes(searchName.toLowerCase());
      })
    : results;

  const selectedResult = results.find((r) => r.id === selectedId);
  const selectedName = selectedResult
    ? 'stage_name' in selectedResult
      ? selectedResult.stage_name
      : selectedResult.venue_name
    : '';

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedId) errs.counterparty = 'Selecione uma contraparte.';
    if (!date) errs.date = 'Data é obrigatória.';
    if (!time) errs.time = 'Horário é obrigatório.';
    if (!value || parseFloat(value) <= 0) errs.value = 'O valor deve ser maior que zero.';
    return errs;
  };

  const { data: myArtistProfile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: () => artists.getArtistProfile(),
    enabled: role === 'ARTIST',
  });

  const { data: myVenueProfile } = useQuery({
    queryKey: ['venue-profile'],
    queryFn: () => venues.getVenueProfile(),
    enabled: role === 'VENUE',
  });

  const createContract = useMutation({
    mutationFn: (data: Omit<Contract, 'id' | 'status' | 'created_at'>) =>
      contractsApi.createContract(data),
    onSuccess: () => router.push('/contracts'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const artist_id = role === 'ARTIST' ? (myArtistProfile?.id ?? '') : selectedId;
    const venue_id = role === 'VENUE' ? (myVenueProfile?.id ?? '') : selectedId;

    createContract.mutate({
      artist_id,
      venue_id,
      date,
      time,
      value: parseFloat(value),
      details: details || undefined,
      tags,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Novo Contrato</h1>

      <Card className="border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--card-foreground)]">
            {role === 'VENUE' ? 'Encontrar um Artista' : 'Encontrar um Venue'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Search */}
            <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] p-4">
              <div className="flex flex-col gap-1">
                <Label>Buscar por Cidade</Label>
                <CitySearch
                  value={searchCity}
                  onChange={setSearchCity}
                  onCitySelect={(city) => {
                    const parts = city.split(', ');
                    setSearchCity(parts[0] ?? city);
                  }}
                  placeholder="Digite uma cidade para buscar…"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="search_name">
                  Filtrar por Nome do {role === 'VENUE' ? 'Artista' : 'Venue'}
                </Label>
                <Input
                  id="search_name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Filtro de nome opcional"
                />
              </div>

              {filteredResults.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label>Selecionar {role === 'VENUE' ? 'Artista' : 'Venue'}</Label>
                  <div
                    role="listbox"
                    aria-label={`Resultados de ${role === 'VENUE' ? 'artista' : 'venue'}`}
                    className="max-h-48 overflow-y-auto rounded-md border border-[var(--border)]"
                  >
                    {filteredResults.map((r) => {
                      const name = 'stage_name' in r ? r.stage_name : r.venue_name;
                      const city = r.city;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          role="option"
                          aria-selected={selectedId === r.id}
                          onClick={() => setSelectedId(r.id)}
                          className={[
                            'w-full px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]',
                            selectedId === r.id
                              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                              : 'hover:bg-[var(--muted)] text-[var(--foreground)]',
                          ].join(' ')}
                        >
                          <span className="font-medium">{name}</span>
                          {city && (
                            <span className="ml-2 opacity-70">{city}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedName && (
                <p className="text-sm text-green-600">
                  Selecionado: <strong>{selectedName}</strong>
                </p>
              )}
              {errors.counterparty && (
                <p role="alert" className="text-sm text-red-600">
                  {errors.counterparty}
                </p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="contract_date">Data *</Label>
                <Input
                  id="contract_date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-describedby={errors.date ? 'date-error' : undefined}
                />
                {errors.date && (
                  <p id="date-error" role="alert" className="text-xs text-red-600">
                    {errors.date}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="contract_time">Horário *</Label>
                <Input
                  id="contract_time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-describedby={errors.time ? 'time-error' : undefined}
                />
                {errors.time && (
                  <p id="time-error" role="alert" className="text-xs text-red-600">
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            {/* Value */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="contract_value">Valor (R$) *</Label>
              <Input
                id="contract_value"
                type="number"
                min="0.01"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                aria-describedby={errors.value ? 'value-error' : undefined}
              />
              {errors.value && (
                <p id="value-error" role="alert" className="text-xs text-red-600">
                  {errors.value}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="contract_details">Detalhes / Observações</Label>
              <Textarea
                id="contract_details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Detalhes adicionais ou requisitos especiais…"
              />
            </div>

            {/* Tags */}
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[var(--foreground)]">
                Tags do Contrato
              </legend>
              <div className="flex flex-wrap gap-4">
                {CONTRACT_TAGS.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <Checkbox
                      id={`tag_${tag}`}
                      checked={tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    />
                    <Label htmlFor={`tag_${tag}`} className="cursor-pointer">
                      {CONTRACT_TAG_LABELS[tag] ?? tag}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>

            {createContract.isError && (
              <p role="alert" className="text-sm text-red-600">
                Falha ao criar contrato. Tente novamente.
              </p>
            )}

            <Button
              type="submit"
              disabled={createContract.isPending}
              className="self-start bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
            >
              {createContract.isPending ? 'Criando…' : 'Criar Contrato'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
