'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, LocateFixed, RefreshCw } from 'lucide-react';
import { PRESET_CITIES, type GeoLocationResult, type TempUnit } from '@/lib/weather';

export function WeatherLocationBar({
  currentLocation,
  unit,
  loading,
  onSelectLocation,
  onToggleUnit,
  onRefresh,
}: {
  currentLocation: GeoLocationResult;
  unit: TempUnit;
  loading: boolean;
  onSelectLocation: (loc: GeoLocationResult) => void;
  onToggleUnit: (unit: TempUnit) => void;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [geoMessage, setGeoMessage] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/weather?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results?: GeoLocationResult[] };
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 240);
    return () => clearTimeout(timer);
  }, [query]);

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoMessage('Location access unavailable in this browser.');
      return;
    }
    setGeoMessage('Locating…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoMessage('');
        onSelectLocation({
          name: 'My Location',
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      () => {
        setGeoMessage('Could not access device coordinates.');
      },
      { timeout: 6000 }
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Search & Geolocation */}
        <div className="flex items-center gap-2 flex-1 max-w-xl relative" ref={wrapRef}>
          <div className="relative flex-1">
            <label htmlFor="wf-city-search" className="sr-only">
              Search city or postal code
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="wf-city-search"
              type="search"
              value={query}
              onFocus={() => {
                if (results.length) setOpen(true);
              }}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                if (next.trim().length < 2) {
                  setResults([]);
                  setOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results.length > 0) {
                  e.preventDefault();
                  onSelectLocation(results[0]);
                  setQuery('');
                  setOpen(false);
                }
              }}
              placeholder="Search city or region…"
              className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />

            {open && (results.length > 0 || searching) && (
              <div
                role="listbox"
                aria-label="Matching locations"
                className="absolute left-0 right-0 top-11 z-30 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
              >
                {searching && results.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500">Searching locations…</div>
                ) : (
                  results.map((item, i) => (
                    <button
                      key={`${item.name}-${item.latitude}-${i}`}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        onSelectLocation(item);
                        setQuery('');
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between border-b last:border-b-0 border-slate-100"
                    >
                      <span className="font-medium text-slate-900">
                        {item.name}
                        {item.admin1 ? `, ${item.admin1}` : ''}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.country ?? ''}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGeolocate}
            aria-label="Use my device location"
            title="Use my device location"
            className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0"
          >
            <LocateFixed className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Locate</span>
          </button>
        </div>

        {/* Preset cities + Unit Toggle + Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pr-1 pb-0.5" aria-label="Quick locations">
            {PRESET_CITIES.map((city) => {
              const active = city.name === currentLocation.name;
              return (
                <button
                  key={city.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectLocation(city)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg" role="group" aria-label="Temperature unit">
            {(['F', 'C'] as const).map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={unit === u}
                onClick={() => onToggleUnit(u)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  unit === u ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                °{u}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh weather forecast"
            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{loading ? 'Updating' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {geoMessage && <p className="text-xs text-slate-600">{geoMessage}</p>}
    </div>
  );
}
