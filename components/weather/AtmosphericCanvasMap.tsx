'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { formatHourLabel, formatTemp, formatWind, windCompass, type GeoLocationResult, type HourlyPoint, type TempUnit } from '@/lib/weather';

type MapLayer = 'radar' | 'wind' | 'thermal' | 'cloud';

const LAYERS: { id: MapLayer; label: string }[] = [
  { id: 'radar', label: 'Precip Radar' },
  { id: 'wind', label: 'Wind Flow' },
  { id: 'thermal', label: 'Thermal Field' },
  { id: 'cloud', label: 'Cloud Cover' },
];

export function AtmosphericCanvasMap({
  location,
  hourly,
  unit,
}: {
  location: GeoLocationResult;
  hourly: HourlyPoint[];
  unit: TempUnit;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layer, setLayer] = useState<MapLayer>('radar');
  const [hourOffset, setHourOffset] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [playing, setPlaying] = useState<boolean>(false);
  const [probe, setProbe] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 1200, height: 288 });

  const slice = hourly.slice(0, 13);
  const activeHour = slice[Math.min(hourOffset, Math.max(0, slice.length - 1))] ?? hourly[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || slice.length <= 1) return;
    const timer = setInterval(() => {
      setHourOffset((prev) => (prev + 1) % slice.length);
    }, 900);
    return () => clearInterval(timer);
  }, [playing, slice.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeHour) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvasSize.width;
    const h = canvasSize.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Base slate-navy cartographic canvas
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0b1628');
    bg.addColorStop(1, '#11223b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Coordinate graticule grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    const step = 48 * zoom;
    const offsetX = (w / 2) % step;
    const offsetY = (h / 2) % step;
    for (let x = offsetX; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = offsetY; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Concentric range rings around station (25 mi, 50 mi, 100 mi)
    const cx = w / 2;
    const cy = h / 2;
    [60, 120, 180].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * zoom, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText(`${(idx + 1) * 30} mi`, cx + 4, cy - r * zoom + 12);
    });

    const phase = hourOffset * 0.45;
    const radAngle = ((activeHour.windDir + 180) * Math.PI) / 180;
    const driftX = Math.cos(radAngle) * hourOffset * 14 * zoom;
    const driftY = Math.sin(radAngle) * hourOffset * 14 * zoom;

    if (layer === 'radar') {
      const intensity = Math.max(0.12, activeHour.precipProb / 100);
      for (let i = 0; i < 9; i++) {
        const bx = ((cx + driftX + Math.sin(i * 1.9 + phase) * 180) % (w + 100)) - 50;
        const by = ((cy + driftY + Math.cos(i * 1.4 + phase * 0.7) * 110) % (h + 80)) - 40;
        const rad = (50 + (i % 4) * 28) * zoom * (0.6 + intensity * 0.7);
        const grad = ctx.createRadialGradient(bx, by, 4, bx, by, rad);
        if (activeHour.precipProb >= 45) {
          grad.addColorStop(0, `rgba(14, 165, 233, ${0.42 * intensity})`);
          grad.addColorStop(0.55, `rgba(56, 189, 248, ${0.22 * intensity})`);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        } else {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (layer === 'thermal') {
      const warmRatio = Math.max(0, Math.min(1, (activeHour.temperatureF - 25) / 65));
      const rCol = Math.round(56 + warmRatio * 190);
      const gCol = Math.round(130 + (1 - Math.abs(warmRatio - 0.5) * 2) * 60);
      const bCol = Math.round(240 - warmRatio * 185);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, 0.34)`);
      grad.addColorStop(0.5, `rgba(${Math.min(255, rCol + 20)}, ${gCol}, ${Math.max(40, bCol - 20)}, 0.20)`);
      grad.addColorStop(1, `rgba(${Math.max(30, rCol - 35)}, ${gCol}, ${Math.min(255, bCol + 35)}, 0.30)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Isotherm contours
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.2;
      for (let row = 1; row <= 4; row++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 24) {
          const y = (h / 5) * row + Math.sin(x * 0.012 + phase + row) * 18 * zoom;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    } else if (layer === 'cloud') {
      const cloudFrac = activeHour.cloudCover / 100;
      for (let i = 0; i < 12; i++) {
        const bx = ((cx + driftX * 0.8 + Math.cos(i * 2.1) * 220) % (w + 120)) - 60;
        const by = ((cy + driftY * 0.8 + Math.sin(i * 1.7) * 120) % (h + 80)) - 40;
        const rad = (70 + (i % 3) * 35) * zoom;
        const grad = ctx.createRadialGradient(bx, by, 10, bx, by, rad);
        grad.addColorStop(0, `rgba(226, 232, 240, ${0.38 * cloudFrac})`);
        grad.addColorStop(1, 'rgba(226, 232, 240, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Always overlay clean wind vector arrows on 'wind', subtle vectors otherwise
    const cols = 9;
    const rows = 5;
    for (let c = 1; c < cols; c++) {
      for (let rIdx = 1; rIdx < rows; rIdx++) {
        const x = (w / cols) * c;
        const y = (h / rows) * rIdx;
        const localAngle = radAngle + Math.sin((x + y) * 0.01 + phase) * 0.16;
        const len = (layer === 'wind' ? 22 : 12) * Math.min(1.4, 0.7 + activeHour.windMph / 25);
        const ex = x + Math.cos(localAngle) * len;
        const ey = y + Math.sin(localAngle) * len;

        ctx.strokeStyle = layer === 'wind' ? 'rgba(56, 189, 248, 0.88)' : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = layer === 'wind' ? 1.8 : 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Arrowhead
        const headLen = layer === 'wind' ? 6 : 4;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headLen * Math.cos(localAngle - 0.5), ey - headLen * Math.sin(localAngle - 0.5));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headLen * Math.cos(localAngle + 0.5), ey - headLen * Math.sin(localAngle + 0.5));
        ctx.stroke();
      }
    }

    // Center station marker
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 12px sans-serif';
    ctx.fillText(location.name, cx + 12, cy + 4);
  }, [activeHour, hourOffset, layer, location.name, zoom, canvasSize.width, canvasSize.height]);

  if (!activeHour) return null;

  return (
    <section
      id="map"
      aria-labelledby="radar-map-title"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 id="radar-map-title" className="text-lg font-semibold text-slate-900">
            Regional Atmospheric Field
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {location.latitude.toFixed(3)}°N, {Math.abs(location.longitude).toFixed(3)}°{location.longitude < 0 ? 'W' : 'E'} · Wind {formatWind(activeHour.windMph, unit)} {windCompass(activeHour.windDir)} · Cloud {Math.round(activeHour.cloudCover)}%
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="tablist" aria-label="Map layer">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={layer === l.id}
                onClick={() => setLayer(l.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  layer === l.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-4 rounded-lg overflow-hidden border border-slate-200 bg-[#0b1628]">
        <canvas
          ref={canvasRef}
          width={880}
          height={320}
          data-testid="atmospheric-canvas"
          className="w-full h-64 sm:h-72 block cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            const lat = location.latitude - (ny * 2.4) / zoom;
            const lon = location.longitude + (nx * 3.2) / zoom;
            const label =
              layer === 'radar'
                ? `${Math.round(activeHour.precipProb)}% precip prob`
                : layer === 'wind'
                  ? `${formatWind(activeHour.windMph, unit)} ${windCompass(activeHour.windDir)}`
                  : layer === 'thermal'
                    ? formatTemp(activeHour.temperatureF, unit)
                    : `${Math.round(activeHour.cloudCover)}% cloud`;
            setProbe({ lat, lon, label });
          }}
          onMouseLeave={() => setProbe(null)}
        />

        {/* Overlay zoom controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/75 border border-slate-700/80 rounded-lg p-1 text-white">
          <button
            type="button"
            aria-label="Zoom out map"
            onClick={() => setZoom((z) => Math.max(0.7, Math.round((z - 0.2) * 10) / 10))}
            className="p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Reset map zoom"
            onClick={() => setZoom(1)}
            className="p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Zoom in map"
            onClick={() => setZoom((z) => Math.min(1.8, Math.round((z + 0.2) * 10) / 10))}
            className="p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Probe HUD */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-700/70 rounded-md px-2.5 py-1.5 text-[11px] font-mono text-slate-200">
          {probe
            ? `${probe.lat.toFixed(2)}°, ${probe.lon.toFixed(2)}° · ${probe.label}`
            : `Station ${location.name} · ${formatHourLabel(activeHour.time)} (+${hourOffset}h)`}
        </div>
      </div>

      {/* Forecast timeline scrubber */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause forecast loop' : 'Play forecast loop'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {playing ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
            {playing ? 'Pause' : 'Animate 12h'}
          </button>
          <span className="text-xs font-mono text-slate-600">
            Frame: {formatHourLabel(activeHour.time)} (+{hourOffset}h)
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <label htmlFor="radar-time-slider" className="text-xs text-slate-500 whitespace-nowrap">
            Timeline
          </label>
          <input
            id="radar-time-slider"
            type="range"
            min={0}
            max={Math.max(0, slice.length - 1)}
            value={hourOffset}
            onChange={(e) => {
              setPlaying(false);
              setHourOffset(Number(e.target.value));
            }}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
}
