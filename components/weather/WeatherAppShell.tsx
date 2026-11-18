'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  Eye,
  Gauge,
  GitCompare,
  Layers,
  Map as MapIcon,
  Snowflake,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import {
  PRESET_CITIES,
  computeBestWindows,
  computeModelConsensus,
  decodeWmoCode,
  dewPointComfort,
  formatClockTime,
  formatDayLabel,
  formatHourLabel,
  formatPrecip,
  formatPressure,
  formatTemp,
  formatVisibility,
  formatWind,
  getSeedWeather,
  pressureTrend,
  windCompass,
  type GeoLocationResult,
  type TempUnit,
  type WeatherBundle,
  type WeatherConditionKind,
} from '@/lib/weather';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import { WeatherLocationBar } from '@/components/weather/WeatherLocationBar';
import { HourlyTelemetryChart } from '@/components/weather/HourlyTelemetryChart';
import { SolarLunarArc } from '@/components/weather/SolarLunarArc';
import { OutdoorWindowsPanel, type WindowTab } from '@/components/weather/OutdoorWindowsPanel';
import { AtmosphericCanvasMap } from '@/components/weather/AtmosphericCanvasMap';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';

function skyBackdropClass(kind: WeatherConditionKind, isDay: boolean): string {
  if (!isDay) return 'from-[#091326] via-[#102242] to-[#172f59]';
  switch (kind) {
    case 'clear':
      return 'from-[#0d2854] via-[#17468a] to-[#1e5ba8]';
    case 'partly-cloudy':
      return 'from-[#112a4f] via-[#1c4273] to-[#28568e]';
    case 'cloudy':
    case 'fog':
      return 'from-[#1c293b] via-[#2b3c54] to-[#394d69]';
    case 'rain':
      return 'from-[#102438] via-[#183854] to-[#1f496b]';
    case 'snow':
      return 'from-[#182e47] via-[#264666] to-[#355d82]';
    case 'thunderstorm':
      return 'from-[#121933] via-[#1e294f] to-[#2a3869]';
  }
}

export function WeatherAppShell({ mode = 'main' }: { mode?: 'main' | 'horizon' }) {
  const [location, setLocation] = useState<GeoLocationResult>(PRESET_CITIES[0]);
  const [unit, setUnit] = useState<TempUnit>('F');
  const [weather, setWeather] = useState<WeatherBundle>(() => getSeedWeather(PRESET_CITIES[0]));
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedDay, setExpandedDay] = useState<number>(0);
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [activeWindowTab, setActiveWindowTab] = useState<WindowTab>('best-times');

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
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Forecast unavailable'))))
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
    setExpandedDay(0);
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTick((t) => t + 1);
  };

  const jumpToSection = (id: string, windowTab?: WindowTab) => {
    if (windowTab) {
      setActiveWindowTab(windowTab);
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cond = decodeWmoCode(weather.current.weatherCode);
  const pTrend = useMemo(() => pressureTrend(weather.hourly), [weather.hourly]);
  const windows = computeBestWindows(weather.hourly, weather.airQuality.usAqi);
  const consensus = useMemo(() => computeModelConsensus(weather.hourly), [weather.hourly]);
  const comfort = dewPointComfort(weather.current.dewPointF);

  const today = weather.daily[0];
  const nextHour = weather.hourly[1] ?? weather.hourly[0];
  const currentHour = weather.hourly[0];
  const weekMin = Math.min(...weather.daily.map((d) => d.tempMinF));
  const weekMax = Math.max(...weather.daily.map((d) => d.tempMaxF));
  const weekSpan = Math.max(1, weekMax - weekMin);

  const isHorizon = mode === 'horizon';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar Contract: strictly 3 zones */}
      <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          <Link
            href={isHorizon ? '/weather-fusion/experimental/horizon' : '/'}
            className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#0d2854] text-white flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4 text-amber-300" aria-hidden="true" />
            </span>
            <span>{isHorizon ? 'Weather Nourie · Horizon' : 'Weather Nourie'}</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-slate-600"
            aria-label={isHorizon ? 'Horizon sections' : 'Weather Nourie navigation'}
          >
            <a href="#overview" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Overview
            </a>
            <a href="#hourly" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Hourly
            </a>
            <a href="#daily" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              7-Day
            </a>
            <a href="#windows" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Windows
            </a>
            <a href="#map" className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0">
              Map
            </a>
            <Link
              href="/weather-fusion/experimental"
              className="text-blue-700 hover:text-blue-800 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Experimental
            </Link>
            <Link
              href="/deal-desk"
              className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Deal Desk
            </Link>
          </nav>

          <div className="shrink-0 flex items-center gap-2">
            {isHorizon ? (
              <Link
                href="/weather-fusion/experimental"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200/70 transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Experimental</span>
              </Link>
            ) : (
              <PWAInstallButton variant="dark" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-8 space-y-6">
        {/* Workspace Control Bar */}
        <WeatherLocationBar
          currentLocation={location}
          unit={unit}
          loading={loading}
          onSelectLocation={handleSelectLocation}
          onToggleUnit={setUnit}
          onRefresh={handleRefresh}
        />

        {/* Quick Section Jump Strip (mirrors weather-fusion app quick-access tools) */}
        <nav
          aria-label="Quick weather modules"
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {[
            { label: 'Map', icon: MapIcon, onClick: () => jumpToSection('map') },
            { label: 'Your Day', icon: Clock, onClick: () => jumpToSection('hourly') },
            { label: '7-Day', icon: Calendar, onClick: () => jumpToSection('daily') },
            { label: 'AQI', icon: Activity, onClick: () => jumpToSection('windows', 'air-quality') },
            { label: 'Car Wash', icon: Droplets, onClick: () => jumpToSection('windows', 'car-wash') },
            { label: 'Feel Meter', icon: Thermometer, onClick: () => jumpToSection('windows', 'feel-meter') },
            { label: 'Snow', icon: Snowflake, onClick: () => jumpToSection('windows', 'snow-freeze') },
            { label: 'Compare', icon: GitCompare, onClick: () => jumpToSection('windows', 'models') },
            { label: 'Best Times', icon: Sparkles, onClick: () => jumpToSection('windows', 'best-times') },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active NWS Warnings (only when present) */}
        {weather.alerts.length > 0 && (
          <section
            aria-label="Official NWS weather alerts"
            className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2"
          >
            {weather.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-amber-950">
                  <div className="font-semibold">
                    {alert.event} · {alert.severity}
                  </div>
                  <p className="text-xs text-amber-900 mt-0.5">{alert.headline}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Living Sky Atmospheric Hero */}
        <section
          id="overview"
          aria-labelledby="horizon-city-heading"
          className={`bg-gradient-to-br ${skyBackdropClass(cond.kind, weather.current.isDay)} text-white rounded-xl p-6 sm:p-8 border border-slate-800/40`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="text-xs font-mono text-sky-200/90 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{weather.source === 'live' ? '● Live Telemetry' : '● Offline Seed'}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {weather.location.latitude.toFixed(2)}°N, {Math.abs(weather.location.longitude).toFixed(2)}°
                    {weather.location.longitude < 0 ? 'W' : 'E'}
                  </span>
                  {weather.location.elevation !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Elev {weather.location.elevation} m</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{weather.timezoneAbbrev}</span>
                </div>

                <h1
                  id="horizon-city-heading"
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2 text-balance"
                >
                  {weather.location.name}
                  {weather.location.admin1 ? `, ${weather.location.admin1}` : ''}
                </h1>
                <p className="text-sm text-sky-100/85 mt-1">{cond.detail}</p>
              </div>

              <div className="flex flex-wrap items-end gap-6">
                <div className="flex items-center gap-4">
                  <WeatherIcon code={weather.current.weatherCode} isDay={weather.current.isDay} className="w-14 h-14" />
                  <div className="text-6xl sm:text-7xl font-mono font-semibold tracking-tight leading-none">
                    {formatTemp(weather.current.temperatureF, unit, false)}
                    <span className="text-2xl text-sky-200/80 ml-0.5 align-top">°{unit}</span>
                  </div>
                </div>

                <div className="space-y-1 pb-1">
                  <div className="text-lg font-semibold text-white">{cond.label}</div>
                  <div className="text-sm text-sky-100/90 font-mono">
                    Feels like {formatTemp(weather.current.apparentF, unit)}
                    {today
                      ? ` · H ${formatTemp(today.tempMaxF, unit, false)} / L ${formatTemp(today.tempMinF, unit, false)}`
                      : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/15 lg:pl-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-sky-200/80">
                  <Wind className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Wind & Gusts</span>
                </div>
                <div className="text-xl font-mono font-semibold text-white mt-1.5">
                  {formatWind(weather.current.windMph, unit)} {windCompass(weather.current.windDir)}
                </div>
                <div className="text-xs font-mono text-sky-200/75 mt-0.5">
                  Gusts {formatWind(weather.current.windGustMph, unit)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-sky-200/80">
                  <Droplets className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dew Point & RH</span>
                </div>
                <div className="text-xl font-mono font-semibold text-white mt-1.5">
                  {formatTemp(weather.current.dewPointF, unit)}
                </div>
                <div className="text-xs font-mono text-sky-200/75 mt-0.5">
                  {Math.round(weather.current.humidity)}% RH · {comfort.level}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-sky-200/80">
                  <Gauge className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Barometric MSL</span>
                </div>
                <div className="text-xl font-mono font-semibold text-white mt-1.5">
                  {formatPressure(weather.current.pressureHpa, unit)}
                </div>
                <div className="text-xs font-mono text-sky-200/75 mt-0.5">
                  {pTrend.label} ({pTrend.deltaHpa >= 0 ? '+' : ''}
                  {pTrend.deltaHpa} hPa/3h)
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-sky-200/80">
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>UV & Solar Flux</span>
                </div>
                <div className="text-xl font-mono font-semibold text-white mt-1.5">
                  UV {weather.current.uvIndex.toFixed(1)}
                </div>
                <div className="text-xs font-mono text-sky-200/75 mt-0.5">
                  {Math.round(currentHour?.solarRadWm2 ?? 0)} W/m² shortwave
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-sky-200/80">
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Visibility & Sky</span>
                </div>
                <div className="text-xl font-mono font-semibold text-white mt-1.5">
                  {formatVisibility(weather.current.visibilityFt, unit)}
                </div>
                <div className="text-xs font-mono text-sky-200/75 mt-0.5">
                  {Math.round(weather.current.cloudCover)}% total cloud cover
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-sky-200/80">
                  <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Air Quality</span>
                </div>
                <div className="text-xl font-mono font-semibold text-white mt-1.5">
                  {Math.round(weather.airQuality.usAqi)} AQI
                </div>
                <div className="text-xs font-mono text-sky-200/75 mt-0.5">
                  {weather.airQuality.category} · PM2.5 {weather.airQuality.pm25.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Column Full-Width Briefing Strip */}
        <section
          aria-label="Immediate operational briefing"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
        >
          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500 font-medium">Next Hour Shift</div>
            <div className="text-xl font-mono font-semibold text-slate-900 mt-1">
              {nextHour ? `${formatTemp(nextHour.temperatureF, unit)} · ${formatHourLabel(nextHour.time)}` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {nextHour ? `${Math.round(nextHour.precipProb)}% precip prob · ${formatWind(nextHour.windMph, unit)}` : ''}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500 font-medium">Peak Outdoor Window</div>
            <div className="text-xl font-mono font-semibold text-slate-900 mt-1">
              {windows.bestHours[0] ? `${formatHourLabel(windows.bestHours[0].time)} (${windows.bestHours[0].score}/100)` : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {windows.bestHours[0] ? `${formatTemp(windows.bestHours[0].tempF, unit)} · ${Math.round(windows.bestHours[0].precipProb)}% rain` : ''}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500 font-medium">Car Wash Window</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{windows.carWash.rating}</div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              {windows.carWash.dryStreakHours}h dry streak ahead
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500 font-medium">Model Consensus (24h)</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{consensus.agreementLabel}</div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              GFS vs ECMWF spread {consensus.avgSpreadF.toFixed(1)}°F avg
            </div>
          </div>
        </section>

        {/* 48-Hour Multi-Channel Telemetry Chart */}
        <HourlyTelemetryChart hourly={weather.hourly} unit={unit} />

        {/* Two-Column Forecast Grid: 7-Day Matrix + Solar/Boundary Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section
            id="daily"
            aria-labelledby="seven-day-matrix-title"
            className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
          >
            <div className="pb-4 border-b border-slate-100">
              <h2 id="seven-day-matrix-title" className="text-lg font-semibold text-slate-900">
                7-Day Forecast Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any day row to inspect sunrise, wind gusts, precipitation accumulation, UV, and solar output
              </p>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {weather.daily.map((d, idx) => {
                const isOpen = expandedDay === idx;
                const dCond = decodeWmoCode(d.weatherCode);
                const leftPct = ((d.tempMinF - weekMin) / weekSpan) * 100;
                const widthPct = Math.max(8, ((d.tempMaxF - d.tempMinF) / weekSpan) * 100);

                return (
                  <div key={d.date} className="py-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpandedDay(isOpen ? -1 : idx)}
                      className="w-full py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-left"
                    >
                      <div className="w-28 sm:w-32 shrink-0">
                        <div className="text-sm font-semibold text-slate-900">{formatDayLabel(d.date, idx)}</div>
                        <div className="text-[11px] text-slate-500 truncate">{dCond.label}</div>
                      </div>

                      <div className="flex items-center gap-2 w-16 shrink-0">
                        <WeatherIcon code={d.weatherCode} className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-mono text-sky-700">{Math.round(d.precipProbMax)}%</span>
                      </div>

                      <div className="flex items-center gap-2.5 flex-1 max-w-xs">
                        <span className="text-xs font-mono text-slate-500 w-9 text-right">
                          {formatTemp(d.tempMinF, unit, false)}
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full relative overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-500 to-amber-500"
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-900 w-9">
                          {formatTemp(d.tempMaxF, unit, false)}
                        </span>
                      </div>

                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 pt-2 bg-slate-50/80 rounded-lg mb-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-100">
                        <div>
                          <div className="text-slate-500">Feels Range</div>
                          <div className="font-mono font-semibold text-slate-900 mt-0.5">
                            {formatTemp(d.apparentMinF, unit, false)} to {formatTemp(d.apparentMaxF, unit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Precip / Snow</div>
                          <div className="font-mono font-semibold text-slate-900 mt-0.5">
                            {formatPrecip(d.precipSumIn, unit)} · {d.snowSumIn.toFixed(1)} in snow
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Peak Wind / Gust</div>
                          <div className="font-mono font-semibold text-slate-900 mt-0.5">
                            {formatWind(d.windMaxMph, unit)} / G {Math.round(unit === 'C' ? d.windGustMaxMph * 1.60934 : d.windGustMaxMph)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Sun / UV Max</div>
                          <div className="font-mono font-semibold text-slate-900 mt-0.5">
                            {formatClockTime(d.sunrise)} – {formatClockTime(d.sunset)} · UV {d.uvIndexMax.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="lg:col-span-5 space-y-6">
            <SolarLunarArc currentIso={weather.current.time} today={today} />

            <section
              aria-labelledby="cloud-profile-title"
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
            >
              <div className="pb-3 border-b border-slate-100">
                <h2 id="cloud-profile-title" className="text-base font-semibold text-slate-900">
                  Vertical Cloud & Column Profile
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stratified cloud fractions and atmospheric stability for the current hour
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { label: 'High Cirrus (> 20,000 ft)', value: currentHour?.cloudHigh ?? 0, color: 'bg-sky-400' },
                  { label: 'Mid Deck (6,500–20,000 ft)', value: currentHour?.cloudMid ?? 0, color: 'bg-blue-500' },
                  { label: 'Low Stratus (< 6,500 ft)', value: currentHour?.cloudLow ?? 0, color: 'bg-slate-600' },
                ].map((layer) => (
                  <div key={layer.label}>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>{layer.label}</span>
                      <span className="font-mono font-semibold">{Math.round(layer.value)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${layer.color} rounded-full`} style={{ width: `${layer.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-slate-500">Convective CAPE</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">
                    {Math.round(currentHour?.capeJkg ?? 0)} J/kg
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Freezing Level (0°C)</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">
                    {(currentHour?.freezingLevelFt ?? 0).toLocaleString()} ft
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Interactive Weather Windows & Multi-Model Suite */}
        <OutdoorWindowsPanel
          weather={weather}
          unit={unit}
          activeTab={activeWindowTab}
          onTabChange={setActiveWindowTab}
        />

        {/* Regional Atmospheric Field Canvas */}
        <AtmosphericCanvasMap location={weather.location} hourly={weather.hourly} unit={unit} />

        {/* Scientific Atmospheric Telemetry Grid */}
        <section
          id="atmosphere"
          aria-labelledby="scientific-telemetry-title"
          className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 id="scientific-telemetry-title" className="text-lg font-semibold text-slate-900">
                Atmospheric & Station Telemetry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full instrument readings, moisture differentials, surface metrics, and bulletin status
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600">
              {weather.alerts.length === 0 ? '● Nominal · No active NWS warnings' : `▲ ${weather.alerts.length} active NWS alert(s)`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5">
            {[
              { label: 'MSL Pressure', value: formatPressure(weather.current.pressureHpa, unit), note: `${Math.round(weather.current.pressureHpa)} hPa` },
              { label: 'Surface Pressure', value: formatPressure(weather.current.surfacePressureHpa, unit), note: `${Math.round(weather.current.surfacePressureHpa)} hPa` },
              { label: 'Dew Point Spread', value: `${Math.round(Math.abs(weather.current.temperatureF - weather.current.dewPointF))}°F`, note: `${Math.round(weather.current.humidity)}% RH` },
              { label: 'Soil Moisture', value: `${((currentHour?.soilMoisture ?? 0.25) * 100).toFixed(0)}%`, note: '0–1 cm layer' },
              { label: 'Shortwave Flux', value: `${Math.round(currentHour?.solarRadWm2 ?? 0)} W/m²`, note: `UV ${weather.current.uvIndex.toFixed(1)}` },
              { label: 'Freezing Level', value: `${(currentHour?.freezingLevelFt ?? 0).toLocaleString()} ft`, note: '0°C isotherm' },
            ].map((item) => (
              <div key={item.label} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{item.label}</div>
                <div className="text-lg font-mono font-semibold text-slate-900 mt-1">{item.value}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">{item.note}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white mb-16 md:mb-0">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {isHorizon
              ? 'Weather Nourie · Horizon Branch · Forecast via Open-Meteo & NOAA NWS'
              : 'Weather Nourie · Live Forecast App · Open-Meteo & NOAA NWS'}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/weather-fusion/experimental" className="hover:text-slate-900 hover:underline">
              Experimental Weather
            </Link>
            <Link href="/weather-fusion/experimental/horizon" className="hover:text-slate-900 hover:underline">
              Horizon Branch
            </Link>
            <Link href="/deal-desk" className="hover:text-slate-900 hover:underline">
              Deal Desk
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Standalone App Bottom Tab Dock */}
      <nav
        aria-label="Mobile app quick tabs"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-14">
          {[
            { label: 'Now', icon: Sun, onClick: () => jumpToSection('overview') },
            { label: 'Hourly', icon: Clock, onClick: () => jumpToSection('hourly') },
            { label: '7-Day', icon: Calendar, onClick: () => jumpToSection('daily') },
            { label: 'Tools', icon: Layers, onClick: () => jumpToSection('windows') },
            { label: 'Map', icon: MapIcon, onClick: () => jumpToSection('map') },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-700 hover:text-blue-700 active:bg-slate-50"
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
