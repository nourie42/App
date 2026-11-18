'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Wind, Droplets, Gauge, Sun } from 'lucide-react';
import {
  PRESET_CITIES,
  decodeWmoCode,
  formatDayLabel,
  formatHourLabel,
  formatPressure,
  formatTemp,
  formatWind,
  getSeedWeather,
  windCompass,
  type GeoLocationResult,
  type TempUnit,
  type WeatherBundle,
} from '@/lib/weather';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import { WeatherLocationBar } from '@/components/weather/WeatherLocationBar';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';

export default function ExperimentalWeatherPage() {
  const [location, setLocation] = useState<GeoLocationResult>(PRESET_CITIES[0]);
  const [unit, setUnit] = useState<TempUnit>('F');
  const [weather, setWeather] = useState<WeatherBundle>(() => getSeedWeather(PRESET_CITIES[0]));
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      lat: String(location.latitude),
      lon: String(location.longitude),
      name: location.name,
      ...(location.admin1 ? { admin1: location.admin1 } : {}),
      ...(location.country ? { country: location.country } : {}),
    });
    fetch(`/api/weather?${params.toString()}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Weather fetch failed'))))
      .then((data: WeatherBundle) => setWeather(data))
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setWeather(getSeedWeather(location));
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [location, refreshTick]);

  const handleSelectLocation = (loc: GeoLocationResult) => {
    setLoading(true);
    setLocation(loc);
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTick((t) => t + 1);
  };

  const cond = decodeWmoCode(weather.current.weatherCode);
  const today = weather.daily[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar Contract: 3 zones */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <Link
            href="/weather-fusion/experimental"
            className="text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Weather Nourie Experimental
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Experimental navigation">
            <Link href="/" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Main App
            </Link>
            <a href="#current" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Conditions
            </a>
            <a href="#hourly-strip" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Next 24h
            </a>
            <a href="#seven-day" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              7-Day
            </a>
            <Link
              href="/weather-fusion/experimental/horizon"
              className="text-blue-700 hover:text-blue-800 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Horizon Branch
            </Link>
            <Link href="/deal-desk" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Deal Desk
            </Link>
          </nav>

          <div className="shrink-0">
            <Link
              href="/weather-fusion/experimental/horizon"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open Horizon Branch</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <WeatherLocationBar
          currentLocation={location}
          unit={unit}
          loading={loading}
          onSelectLocation={handleSelectLocation}
          onToggleUnit={setUnit}
          onRefresh={handleRefresh}
        />

        {/* Featured Link Banner to the new Horizon Website Branch */}
        <section
          aria-labelledby="horizon-branch-callout"
          className="bg-gradient-to-br from-[#0d213d] via-[#153663] to-[#1a4b8c] text-white rounded-xl p-6 sm:p-8 border border-slate-800"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="text-xs font-mono tracking-wider uppercase text-sky-300">
                New Experimental Website Branch
              </div>
              <h1 id="horizon-branch-callout" className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                Weather Nourie · Horizon Atmospheric Workspace
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Explore the full-depth branch of Experimental Weather: interactive 48-hour multi-channel telemetry charts, regional radar and wind-flow canvas, ECMWF vs GFS model consensus, air chemistry, solar-lunar arc, and outdoor planning windows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/weather-fusion/experimental/horizon"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-white text-slate-900 rounded-lg hover:bg-sky-50 transition-colors whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span>Launch Horizon Branch</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <PWAInstallButton variant="light" />
            </div>
          </div>
        </section>

        {/* Current Conditions Overview */}
        <section
          id="current"
          aria-labelledby="exp-city-title"
          className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          <div className="lg:col-span-6 space-y-2">
            <div className="text-xs text-slate-500 font-mono">
              {weather.location.name}
              {weather.location.admin1 ? `, ${weather.location.admin1}` : ''} ·{' '}
              {weather.source === 'live' ? 'Live NOAA & Open-Meteo' : 'Offline Seed Forecast'}
            </div>
            <div className="flex items-center gap-4 pt-1">
              <WeatherIcon code={weather.current.weatherCode} isDay={weather.current.isDay} className="w-12 h-12" />
              <div>
                <h2 id="exp-city-title" className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900">
                  {formatTemp(weather.current.temperatureF, unit)}
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  {cond.label} · Feels like {formatTemp(weather.current.apparentF, unit)}
                  {today ? ` · H ${formatTemp(today.tempMaxF, unit, false)} / L ${formatTemp(today.tempMinF, unit, false)}` : ''}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">{cond.detail}</p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Wind className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Wind</span>
              </div>
              <div className="text-lg font-mono font-semibold text-slate-900 mt-1">
                {formatWind(weather.current.windMph, unit)}
              </div>
              <div className="text-xs text-slate-500 font-mono">{windCompass(weather.current.windDir)}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Droplets className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dew Point</span>
              </div>
              <div className="text-lg font-mono font-semibold text-slate-900 mt-1">
                {formatTemp(weather.current.dewPointF, unit)}
              </div>
              <div className="text-xs text-slate-500 font-mono">{Math.round(weather.current.humidity)}% RH</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Gauge className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pressure</span>
              </div>
              <div className="text-lg font-mono font-semibold text-slate-900 mt-1">
                {formatPressure(weather.current.pressureHpa, unit)}
              </div>
              <div className="text-xs text-slate-500 font-mono">{Math.round(weather.current.cloudCover)}% clouds</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>UV / AQI</span>
              </div>
              <div className="text-lg font-mono font-semibold text-slate-900 mt-1">
                UV {weather.current.uvIndex.toFixed(0)}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {Math.round(weather.airQuality.usAqi)} {weather.airQuality.category}
              </div>
            </div>
          </div>
        </section>

        {/* Next 12 Hours Strip */}
        <section id="hourly-strip" className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Next 12 Hours</h2>
            <Link
              href="/weather-fusion/experimental/horizon#hourly"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Full 48h Telemetry Chart →
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 pt-4">
            {weather.hourly.slice(0, 12).map((h) => (
              <div
                key={h.time}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-center space-y-1.5"
              >
                <div className="text-xs font-mono text-slate-500">{formatHourLabel(h.time)}</div>
                <div className="flex justify-center">
                  <WeatherIcon code={h.weatherCode} className="w-4 h-4" />
                </div>
                <div className="text-sm font-mono font-semibold text-slate-900">
                  {formatTemp(h.temperatureF, unit, false)}
                </div>
                <div className="text-[11px] font-mono text-sky-700">{Math.round(h.precipProb)}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* 7-Day Preview */}
        <section id="seven-day" className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">7-Day Outlook</h2>
            <Link
              href="/weather-fusion/experimental/horizon#daily"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Inspect Day-by-Day Telemetry →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 pt-2">
            {weather.daily.map((d, idx) => (
              <div key={d.date} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="w-32 font-medium text-slate-900">{formatDayLabel(d.date, idx)}</div>
                <div className="flex items-center gap-2 text-slate-600 flex-1">
                  <WeatherIcon code={d.weatherCode} className="w-4 h-4 shrink-0" />
                  <span className="truncate">{decodeWmoCode(d.weatherCode).label}</span>
                </div>
                <div className="text-xs font-mono text-sky-700 w-16 text-right">{Math.round(d.precipProbMax)}% rain</div>
                <div className="font-mono text-right w-28">
                  <span className="font-semibold text-slate-900">{formatTemp(d.tempMaxF, unit, false)}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-500">{formatTemp(d.tempMinF, unit, false)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
