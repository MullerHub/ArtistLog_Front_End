'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { artists as artistsApi } from '@/lib/api';
import { CitySearch } from '@/components/common/CitySearch';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const RADIUS_OPTIONS = [10, 25, 50, 100] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function ArtistsPage() {
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [radius, setRadius] = useState<number>(25);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['artists-search', selectedCity, radius],
    queryFn: () => artistsApi.searchArtists(selectedCity, radius),
    enabled: selectedCity.trim().length > 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Encontrar Artistas</h1>

      {/* Search form */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1 min-w-[220px]">
          <Label htmlFor="city-search">Cidade</Label>
          <CitySearch
            value={cityInput}
            onChange={setCityInput}
            onCitySelect={(city) => setSelectedCity(city)}
            placeholder="e.g. São Paulo, SP"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="radius-select">Raio</Label>
          <select
            id="radius-select"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      ) : !selectedCity ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--muted-foreground)]">
          <p className="text-lg font-medium">Busque artistas perto de você</p>
          <p className="text-sm">Informe uma cidade acima para descobrir artistas disponíveis para shows.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--muted-foreground)]">
          <p className="text-lg font-medium">Nenhum artista encontrado</p>
          <p className="text-sm">Tente aumentar o raio de busca ou pesquisar outra cidade.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((artist) => (
            <Card key={artist.id} className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[var(--card-foreground)]">
                  {artist.stage_name}
                </CardTitle>
                <p className="text-sm text-[var(--muted-foreground)]">
                  📍 {artist.city}, {artist.state}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {artist.bio && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{artist.bio}</p>
                )}

                <p className="text-sm font-medium text-[var(--foreground)]">
                  💰 {formatCurrency(artist.cache_base)} por show
                </p>

                {artist.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {artist.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  <Link href={`/artists/${artist.id}`}>
                    <Button size="sm" variant="outline">
                      Ver Perfil
                    </Button>
                  </Link>
                  <Link href={`/contracts/new?artist_id=${artist.id}`}>
                    <Button
                      size="sm"
                      className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-violet-700"
                    >
                      Propor Contrato
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
