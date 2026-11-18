'use client';

import { Sunrise, Sunset, Moon } from 'lucide-react';
import { computeSolarProgress, formatClockTime, moonPhaseInfo, type DailyPoint } from '@/lib/weather';

export function SolarLunarArc({
  currentIso,
  today,
}: {
  currentIso: string;
  today: DailyPoint | undefined;
}) {
  if (!today) return null;

  const solar = computeSolarProgress(currentIso, today.sunrise, today.sunset);
  const moon = moonPhaseInfo(new Date(currentIso.slice(0, 10) + 'T12:00:00Z'));

  // Arc math: semicircle from (24, 108) to (276, 108), radius = 126, center = (150, 108)
  const cx = 150;
  const cy = 108;
  const r = 112;
  const angle = Math.PI * (1 - solar.progress); // PI at sunrise, 0 at sunset
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  return (
    <section
      aria-labelledby="solar-lunar-title"
      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 id="solar-lunar-title" className="text-base font-semibold text-slate-900">
            Solar & Lunar Cycle
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daylight span {solar.daylightFormatted} · Solar energy {today.solarMjM2.toFixed(1)} MJ/m²
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600">
          {solar.isDaylight ? 'Daylight' : 'Night'}
        </span>
      </div>

      <div className="my-4">
        <svg viewBox="0 0 300 128" className="w-full h-32" role="img" aria-label="Solar path horizon arc">
          {/* Horizon baseline */}
          <line x1="20" y1={cy} x2="280" y2={cy} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
          {/* Full sky arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2.5"
          />
          {/* Elapsed daylight arc */}
          {solar.progress > 0 && (
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${sunX.toFixed(1)} ${sunY.toFixed(1)}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          {/* Sun marker */}
          <circle
            cx={sunX}
            cy={sunY}
            r="7"
            fill={solar.isDaylight ? '#f59e0b' : '#475569'}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text x={cx - r} y={cy + 16} textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
            {formatClockTime(today.sunrise)}
          </text>
          <text x={cx + r} y={cy + 16} textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
            {formatClockTime(today.sunset)}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-start gap-2">
          <Sunrise className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div className="text-slate-500">Sunrise</div>
            <div className="font-mono font-semibold text-slate-900 mt-0.5">
              {formatClockTime(today.sunrise)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Sunset className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div className="text-slate-500">Sunset</div>
            <div className="font-mono font-semibold text-slate-900 mt-0.5">
              {formatClockTime(today.sunset)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Moon className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div className="text-slate-500">{moon.name}</div>
            <div className="font-mono font-semibold text-slate-900 mt-0.5">
              {moon.illuminationPct}% lit
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
