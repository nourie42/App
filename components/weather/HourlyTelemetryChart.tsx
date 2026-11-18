'use client';

import { useMemo, useState } from 'react';
import {
  convertTempNumber,
  formatHourLabel,
  formatPrecip,
  formatPressure,
  formatTemp,
  formatWind,
  windCompass,
  type HourlyPoint,
  type TempUnit,
} from '@/lib/weather';

export type TelemetryChannel = 'temp' | 'precip' | 'wind' | 'moisture' | 'solar' | 'pressure';

const CHANNELS: { id: TelemetryChannel; label: string }[] = [
  { id: 'temp', label: 'Temp & Feels' },
  { id: 'precip', label: 'Precip' },
  { id: 'wind', label: 'Wind & Gusts' },
  { id: 'moisture', label: 'Dew Pt & RH' },
  { id: 'solar', label: 'UV & Solar' },
  { id: 'pressure', label: 'Pressure & Clouds' },
];

export function HourlyTelemetryChart({
  hourly,
  unit,
}: {
  hourly: HourlyPoint[];
  unit: TempUnit;
}) {
  const [channel, setChannel] = useState<TelemetryChannel>('temp');
  const [spanHours, setSpanHours] = useState<24 | 48>(24);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const slice = useMemo(() => hourly.slice(0, spanHours), [hourly, spanHours]);
  const clampedIdx = Math.min(activeIdx, Math.max(0, slice.length - 1));
  const selected = slice[clampedIdx] ?? slice[0];

  const chartData = useMemo(() => {
    if (!slice.length) return null;
    const width = 920;
    const height = 240;
    const padL = 44;
    const padR = 16;
    const padT = 18;
    const padB = 30;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;

    const extract = (h: HourlyPoint): { primary: number; secondary: number | null } => {
      switch (channel) {
        case 'temp':
          return {
            primary: convertTempNumber(h.temperatureF, unit),
            secondary: convertTempNumber(h.apparentF, unit),
          };
        case 'precip':
          return { primary: h.precipProb, secondary: h.precipIn * (unit === 'C' ? 25.4 : 1) * 100 };
        case 'wind':
          return {
            primary: unit === 'C' ? Math.round(h.windMph * 1.60934) : Math.round(h.windMph),
            secondary: unit === 'C' ? Math.round(h.windGustMph * 1.60934) : Math.round(h.windGustMph),
          };
        case 'moisture':
          return {
            primary: convertTempNumber(h.dewPointF, unit),
            secondary: h.humidity,
          };
        case 'solar':
          return {
            primary: h.uvIndex,
            secondary: Math.round(h.solarRadWm2 / 100),
          };
        case 'pressure':
          return {
            primary: Math.round(h.pressureHpa),
            secondary: h.cloudCover,
          };
      }
    };

    const pts = slice.map(extract);
    const values = pts.flatMap((p) => (p.secondary !== null && channel !== 'moisture' && channel !== 'pressure' && channel !== 'precip' ? [p.primary, p.secondary] : [p.primary]));
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);
    if (channel === 'precip') {
      minVal = 0;
      maxVal = 100;
    } else if (channel === 'solar') {
      minVal = 0;
      maxVal = Math.max(10, Math.ceil(maxVal + 1));
    } else {
      const pad = Math.max(2, (maxVal - minVal) * 0.16);
      minVal = Math.floor(minVal - pad);
      maxVal = Math.ceil(maxVal + pad);
    }
    const range = Math.max(1, maxVal - minVal);

    const xAt = (i: number) => padL + (slice.length > 1 ? (i / (slice.length - 1)) * innerW : 0);
    const yAt = (v: number) => padT + innerH - ((v - minVal) / range) * innerH;

    const primaryPoints = pts.map((p, i) => `${xAt(i).toFixed(1)},${yAt(p.primary).toFixed(1)}`);
    const primaryPath = `M ${primaryPoints.join(' L ')}`;
    const areaPath = `${primaryPath} L ${xAt(slice.length - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L ${xAt(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;

    let secondaryPath: string | null = null;
    if (channel === 'temp' || channel === 'wind') {
      const secPts = pts.map((p, i) => `${xAt(i).toFixed(1)},${yAt(p.secondary ?? p.primary).toFixed(1)}`);
      secondaryPath = `M ${secPts.join(' L ')}`;
    } else if (channel === 'moisture' || channel === 'pressure') {
      const secPts = pts.map((p, i) => {
        const pct = Math.max(0, Math.min(100, p.secondary ?? 0));
        const y = padT + innerH - (pct / 100) * innerH;
        return `${xAt(i).toFixed(1)},${y.toFixed(1)}`;
      });
      secondaryPath = `M ${secPts.join(' L ')}`;
    }

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: padT + innerH * (1 - t),
      label: Math.round(minVal + range * t),
    }));

    return {
      width,
      height,
      padL,
      padR,
      padT,
      innerW,
      innerH,
      primaryPath,
      areaPath,
      secondaryPath,
      yTicks,
      xAt,
      yAt,
      pts,
    };
  }, [slice, channel, unit]);

  if (!slice.length || !chartData || !selected) return null;

  const selectedPt = chartData.pts[clampedIdx];
  const primaryColor =
    channel === 'temp'
      ? '#1d5bd6'
      : channel === 'precip'
        ? '#0284c7'
        : channel === 'wind'
          ? '#0f766e'
          : channel === 'moisture'
            ? '#2563eb'
            : channel === 'solar'
              ? '#d97706'
              : '#475569';

  return (
    <section
      id="hourly"
      aria-labelledby="hourly-telemetry-title"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 id="hourly-telemetry-title" className="text-lg font-semibold text-slate-900">
            Hourly Atmospheric Telemetry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a parameter stream or scrub across the timeline for hour-by-hour instrumentation
          </p>
        </div>

        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto" role="tablist" aria-label="Telemetry channel">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={channel === c.id}
                onClick={() => setChannel(c.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  channel === c.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0" role="group" aria-label="Forecast horizon">
            {([24, 48] as const).map((hrs) => (
              <button
                key={hrs}
                type="button"
                aria-pressed={spanHours === hrs}
                onClick={() => setSpanHours(hrs)}
                className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  spanHours === hrs
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hrs}H
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live scrubbed readout bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 py-4 border-b border-slate-100">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Hour Window</div>
          <div className="text-base font-mono font-semibold text-slate-900 mt-0.5">
            {formatHourLabel(selected.time)} · {selected.time.slice(5, 10)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Temp / Feels</div>
          <div className="text-base font-mono font-semibold text-slate-900 mt-0.5">
            {formatTemp(selected.temperatureF, unit, false)} / {formatTemp(selected.apparentF, unit)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Precip Chance</div>
          <div className="text-base font-mono font-semibold text-sky-700 mt-0.5">
            {Math.round(selected.precipProb)}% · {formatPrecip(selected.precipIn, unit)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Wind / Gusts</div>
          <div className="text-base font-mono font-semibold text-slate-900 mt-0.5">
            {formatWind(selected.windMph, unit)} {windCompass(selected.windDir)} · G {Math.round(unit === 'C' ? selected.windGustMph * 1.60934 : selected.windGustMph)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Dew Pt / RH</div>
          <div className="text-base font-mono font-semibold text-slate-900 mt-0.5">
            {formatTemp(selected.dewPointF, unit)} · {Math.round(selected.humidity)}%
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Pressure / Cloud</div>
          <div className="text-base font-mono font-semibold text-slate-900 mt-0.5">
            {formatPressure(selected.pressureHpa, unit)} · {Math.round(selected.cloudCover)}%
          </div>
        </div>
      </div>

      {/* SVG Telemetry Plot */}
      <div className="mt-4 relative select-none">
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full h-56 sm:h-64 overflow-visible"
          role="img"
          aria-label={`Interactive ${spanHours}-hour ${channel} chart`}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * chartData.width;
            const ratio = (relX - chartData.padL) / chartData.innerW;
            const idx = Math.max(0, Math.min(slice.length - 1, Math.round(ratio * (slice.length - 1))));
            setActiveIdx(idx);
          }}
        >
          <defs>
            <linearGradient id="wf-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {chartData.yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={chartData.padL}
                x2={chartData.width - chartData.padR}
                y1={t.y}
                y2={t.y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={chartData.padL - 8}
                y={t.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* X axis labels every 3 or 6 hours */}
          {slice.map((h, i) => {
            const step = spanHours === 24 ? 3 : 6;
            if (i % step !== 0 && i !== slice.length - 1) return null;
            return (
              <text
                key={h.time}
                x={chartData.xAt(i)}
                y={chartData.height - 6}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-mono"
              >
                {formatHourLabel(h.time)}
              </text>
            );
          })}

          <path d={chartData.areaPath} fill="url(#wf-area-fill)" />
          {chartData.secondaryPath && (
            <path
              d={chartData.secondaryPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.75"
              strokeDasharray="4 4"
            />
          )}
          <path d={chartData.primaryPath} fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinejoin="round" />

          {/* Active crosshair */}
          <line
            x1={chartData.xAt(clampedIdx)}
            x2={chartData.xAt(clampedIdx)}
            y1={chartData.padT}
            y2={chartData.padT + chartData.innerH}
            stroke="#0f172a"
            strokeOpacity="0.25"
            strokeDasharray="3 3"
          />
          <circle
            cx={chartData.xAt(clampedIdx)}
            cy={chartData.yAt(selectedPt.primary)}
            r="5"
            fill={primaryColor}
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: primaryColor }} />
              {channel === 'temp'
                ? 'Air Temperature'
                : channel === 'precip'
                  ? 'Precip Probability (%)'
                  : channel === 'wind'
                    ? 'Sustained Wind'
                    : channel === 'moisture'
                      ? 'Dew Point'
                      : channel === 'solar'
                        ? 'UV Index'
                        : 'MSL Pressure (hPa)'}
            </span>
            {chartData.secondaryPath && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block border-t border-dashed border-slate-400" />
                {channel === 'temp'
                  ? 'Feels Like'
                  : channel === 'wind'
                    ? 'Peak Gusts'
                    : channel === 'moisture'
                      ? 'Relative Humidity (%)'
                      : 'Cloud Cover (%)'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="hour-scrubber" className="sr-only">Scrub forecast hour</label>
            <input
              id="hour-scrubber"
              type="range"
              min={0}
              max={Math.max(0, slice.length - 1)}
              value={clampedIdx}
              onChange={(e) => setActiveIdx(Number(e.target.value))}
              className="w-36 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
