'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUser } from '@/lib/auth';
import { artists, venues } from '@/lib/api';
import { CitySearch } from '@/components/common/CitySearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ArtistProfile, VenueProfile } from '@/types';

const INFRASTRUCTURE_OPTIONS = ['Palco', 'Sistema de PA', 'Iluminação', 'Camarim', 'Estacionamento'];

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg',
        type === 'success' ? 'bg-green-600' : 'bg-red-600',
      ].join(' ')}
    >
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const user = getUser();
  const role = user?.role;
  const qc = useQueryClient();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── ARTIST state ──────────────────────────────────────────────────────────
  const [stageName, setStageName] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [cacheBase, setCacheBase] = useState('');
  const [artistTags, setArtistTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [artistCity, setArtistCity] = useState('');
  const [artistState, setArtistState] = useState('');

  // ── VENUE state ───────────────────────────────────────────────────────────
  const [venueName, setVenueName] = useState('');
  const [venueBio, setVenueBio] = useState('');
  const [capacity, setCapacity] = useState('');
  const [infrastructure, setInfrastructure] = useState<string[]>([]);
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('');

  // ── Load existing profile ─────────────────────────────────────────────────
  const { data: artistProfile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: () => artists.getArtistProfile(),
    enabled: role === 'ARTIST',
  });

  const { data: venueProfile } = useQuery({
    queryKey: ['venue-profile'],
    queryFn: () => venues.getVenueProfile(),
    enabled: role === 'VENUE',
  });

  useEffect(() => {
    if (artistProfile) {
      setStageName(artistProfile.stage_name ?? '');
      setArtistBio(artistProfile.bio ?? '');
      setCacheBase(artistProfile.cache_base != null ? String(artistProfile.cache_base) : '');
      setArtistTags(artistProfile.tags ?? []);
      setArtistCity(artistProfile.city ?? '');
      setArtistState(artistProfile.state ?? '');
    }
  }, [artistProfile]);

  useEffect(() => {
    if (venueProfile) {
      setVenueName(venueProfile.venue_name ?? '');
      setVenueBio(venueProfile.bio ?? '');
      setCapacity(venueProfile.capacity != null ? String(venueProfile.capacity) : '');
      setInfrastructure(venueProfile.infrastructure ?? []);
      setVenueCity(venueProfile.city ?? '');
      setVenueState(venueProfile.state ?? '');
    }
  }, [venueProfile]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const artistMutation = useMutation({
    mutationFn: (data: Partial<ArtistProfile>) => artists.updateArtistProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['artist-profile'] });
      showToast('Perfil salvo!', 'success');
    },
    onError: () => showToast('Falha ao salvar o perfil.', 'error'),
  });

  const venueMutation = useMutation({
    mutationFn: (data: Partial<VenueProfile>) => venues.updateVenueProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venue-profile'] });
      showToast('Perfil salvo!', 'success');
    },
    onError: () => showToast('Falha ao salvar o perfil.', 'error'),
  });

  // ── Tag helpers ───────────────────────────────────────────────────────────
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !artistTags.includes(trimmed)) {
      setArtistTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setArtistTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // ── Infrastructure helpers ────────────────────────────────────────────────
  const toggleInfrastructure = (item: string) => {
    setInfrastructure((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  // ── Submits ───────────────────────────────────────────────────────────────
  const handleArtistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    artistMutation.mutate({
      stage_name: stageName,
      bio: artistBio,
      cache_base: parseFloat(cacheBase) || 0,
      tags: artistTags,
      city: artistCity,
      state: artistState,
    });
  };

  const handleVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    venueMutation.mutate({
      venue_name: venueName,
      bio: venueBio,
      capacity: parseInt(capacity, 10) || 0,
      infrastructure,
      city: venueCity,
      state: venueState,
    });
  };

  const isPending = artistMutation.isPending || venueMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <h1 className="text-2xl font-bold text-[var(--foreground)]">Perfil</h1>

      {role === 'ARTIST' && (
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--card-foreground)]">Perfil de Artista</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleArtistSubmit} className="flex flex-col gap-5">
              {/* Stage name */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="stage_name">Nome Artístico</Label>
                <Input
                  id="stage_name"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="Seu nome artístico"
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="artist_bio">Bio</Label>
                <Textarea
                  id="artist_bio"
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                  rows={4}
                  placeholder="Conte aos venues sobre você…"
                />
              </div>

              {/* Cache base */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="cache_base">Cachê (R$)</Label>
                <Input
                  id="cache_base"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cacheBase}
                  onChange={(e) => setCacheBase(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="tag_input">Tags de Gênero</Label>
                <div className="flex gap-2">
                  <Input
                    id="tag_input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Digite uma tag e pressione Enter"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Adicionar
                  </Button>
                </div>
                {artistTags.length > 0 && (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Tags de gênero">
                    {artistTags.map((tag) => (
                      <span
                        key={tag}
                        role="listitem"
                        className="flex items-center gap-1 rounded-full bg-[var(--secondary)] px-3 py-1 text-sm text-[var(--foreground)]"
                      >
                        {tag}
                        <button
                          type="button"
                          aria-label={`Remover tag ${tag}`}
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="artist_city">Cidade</Label>
                <CitySearch
                  value={artistCity}
                  onChange={setArtistCity}
                  onCitySelect={(cityName) => {
                    const parts = cityName.split(', ');
                    setArtistCity(parts[0] ?? cityName);
                    setArtistState(parts[1] ?? '');
                  }}
                  placeholder="Buscar sua cidade…"
                />
              </div>

              {/* State */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="artist_state">Estado</Label>
                <Input
                  id="artist_state"
                  value={artistState}
                  onChange={(e) => setArtistState(e.target.value)}
                  placeholder="Estado"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="self-start bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
              >
                {isPending ? 'Salvando…' : 'Salvar Perfil'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {role === 'VENUE' && (
        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--card-foreground)]">Perfil do Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVenueSubmit} className="flex flex-col gap-5">
              {/* Venue name */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="venue_name">Nome do Venue</Label>
                <Input
                  id="venue_name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Nome do seu venue"
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="venue_bio">Bio</Label>
                <Textarea
                  id="venue_bio"
                  value={venueBio}
                  onChange={(e) => setVenueBio(e.target.value)}
                  rows={4}
                  placeholder="Descreva seu venue…"
                />
              </div>

              {/* Capacity */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="ex.: 200"
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
                        id={`infra_${item}`}
                        checked={infrastructure.includes(item)}
                        onCheckedChange={() => toggleInfrastructure(item)}
                      />
                      <Label htmlFor={`infra_${item}`} className="cursor-pointer">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* City */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="venue_city">Cidade</Label>
                <CitySearch
                  value={venueCity}
                  onChange={setVenueCity}
                  onCitySelect={(cityName) => {
                    const parts = cityName.split(', ');
                    setVenueCity(parts[0] ?? cityName);
                    setVenueState(parts[1] ?? '');
                  }}
                  placeholder="Buscar sua cidade…"
                />
              </div>

              {/* State */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="venue_state">Estado</Label>
                <Input
                  id="venue_state"
                  value={venueState}
                  onChange={(e) => setVenueState(e.target.value)}
                  placeholder="Estado"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="self-start bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
              >
                {isPending ? 'Salvando…' : 'Salvar Perfil'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
