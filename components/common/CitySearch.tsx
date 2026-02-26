'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cities as citiesApi } from '@/lib/api';
import type { City } from '@/types';

export interface CitySearchProps {
  value: string;
  onChange: (value: string) => void;
  onCitySelect: (cityName: string) => void;
  placeholder?: string;
  className?: string;
}

export const CitySearch = ({
  value,
  onChange,
  onCitySelect,
  placeholder = 'Search cities…',
  className = '',
}: CitySearchProps) => {
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generatedId = useId();
  const listboxId = `city-listbox-${generatedId}`;

  const search = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!query.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const cities = await citiesApi.searchCities(query);
          setResults(cities);
          setOpen(cities.length > 0);
          setActiveIndex(-1);
        } catch {
          setResults([]);
          setOpen(false);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [],
  );

  useEffect(() => {
    search(value);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, search]);

  const selectCity = (city: City) => {
    const cityName = `${city.name}, ${city.state}`;
    onChange(cityName);
    onCitySelect(cityName);
    setOpen(false);
    setResults([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && e.key !== 'Escape') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          selectCity(results[activeIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const optionId = (index: number) => `${listboxId}-option-${index}`;

  return (
    <div className={['relative', className].join(' ')}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        tabIndex={0}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          // Close only if focus leaves the component entirely
          if (!listRef.current?.contains(e.relatedTarget as Node)) {
            setTimeout(() => setOpen(false), 150);
          }
        }}
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          Buscando…
        </div>
      )}

      {open && results.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Sugestões de cidade"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-md"
        >
          {results.map((city, index) => (
            <li
              key={`${city.name}-${city.state}-${index}`}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                // Prevent blur from firing before click
                e.preventDefault();
                selectCity(city);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={[
                'cursor-pointer px-3 py-2 text-sm',
                index === activeIndex ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {city.name}, {city.state}
              {city.country ? `, ${city.country}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
