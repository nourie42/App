'use client';

import { useState } from 'react';
import {
  computeBestWindows,
  computeModelConsensus,
  dewPointComfort,
  formatHourLabel,
  formatTemp,
  formatWind,
  type WeatherBundle,
  type TempUnit,
} from '@/lib/weather';

export type WindowTab = 'best-times' | 'car-wash' | 'snow-freeze' | 'feel-meter' | 'air-quality' | 'models';

const TABS: { id: WindowTab; label: string }[] = [
  { id: 'best-times', label: 'Best Times' },
  { id: 'car-wash', label: 'Car Wash' },
  { id: 'snow-freeze', label: 'Snow & Freeze' },
  { id: 'feel-meter', label: 'Feel Meter' },
  { id: 'air-quality', label: 'Air Quality' },
  { id: 'models', label: 'Model Compare' },
];

export function OutdoorWindowsPanel({
  weather,
  unit,
  activeTab,
  onTabChange,
}: {
  weather: WeatherBundle;
  unit: TempUnit;
  activeTab?: WindowTab;
  onTabChange?: (tab: WindowTab) => void;
}) {
  const [internalTab, setInternalTab] = useState<WindowTab>('best-times');
  const tab = activeTab ?? internalTab;
  const setTab = (next: WindowTab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };
  const windows = computeBestWindows(weather.hourly, weather.airQuality.usAqi);
  const comfort = dewPointComfort(weather.current.dewPointF);
  const consensus = computeModelConsensus(weather.hourly);
  const aq = weather.airQuality;

  return (
    <section
      id="windows"
      aria-labelledby="outdoor-windows-title"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 id="outdoor-windows-title" className="text-lg font-semibold text-slate-900">
            Weather Intelligence & Windows
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Actionable scheduling windows, comfort indices, air chemistry, and ECMWF vs GFS consensus
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto" role="tablist" aria-label="Weather intelligence modules">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                tab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-5">
        {tab === 'best-times' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Top outdoor hours in the next 24h scored from temperature comfort, precipitation risk, wind gusts, UV load, and air quality.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {windows.bestHours.map((slot, idx) => (
                <div
                  key={slot.time}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Window {idx + 1}</span>
                    <span className="font-mono font-semibold text-blue-700">{slot.score}/100</span>
                  </div>
                  <div className="text-xl font-mono font-semibold text-slate-900 mt-2">
                    {formatHourLabel(slot.time)}
                  </div>
                  <div className="text-xs text-slate-600 font-mono mt-2">
                    {formatTemp(slot.tempF, unit)} · {formatWind(slot.windMph, unit)} · {Math.round(slot.precipProb)}% rain
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'car-wash' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Wash Outlook</div>
              <div className="text-2xl font-semibold text-slate-900 mt-1">{windows.carWash.rating}</div>
              <p className="text-sm text-slate-600 mt-2">{windows.carWash.summary}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Dry Streak Ahead</div>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1">
                {windows.carWash.dryStreakHours} hours
              </div>
              <p className="text-xs text-slate-500 mt-2">Continuous period below 35% precipitation probability</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Next Rain Risk</div>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1">
                {windows.carWash.nextRainTime ? formatHourLabel(windows.carWash.nextRainTime) : 'None in 48h'}
              </div>
              <p className="text-xs text-slate-500 mt-2">First upcoming hour reaching measurable rain risk</p>
            </div>
          </div>
        )}

        {tab === 'snow-freeze' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">48-Hour Freeze Status</div>
              <div className="text-2xl font-semibold text-slate-900 mt-1">{windows.snowFreeze.riskLabel}</div>
              <p className="text-sm text-slate-600 mt-2">{windows.snowFreeze.summary}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Minimum Temperature / Freezing Level</div>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1">
                {formatTemp(windows.snowFreeze.minTempF, unit)}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-2">
                0°C isotherm at {weather.hourly[0]?.freezingLevelFt.toLocaleString()} ft ASL
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">48h Snow Accumulation</div>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1">
                {unit === 'C'
                  ? `${(windows.snowFreeze.totalSnowIn * 2.54).toFixed(1)} cm`
                  : `${windows.snowFreeze.totalSnowIn.toFixed(1)} in`}
              </div>
              <p className="text-xs text-slate-500 mt-2">{windows.snowFreeze.frostHours} hours at or below 34°F</p>
            </div>
          </div>
        )}

        {tab === 'feel-meter' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Dew Point Comfort</div>
              <div className="text-2xl font-semibold text-slate-900 mt-1">{comfort.level}</div>
              <p className="text-sm text-slate-600 mt-2">{comfort.summary}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Moisture & Spread</div>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1">
                {formatTemp(weather.current.dewPointF, unit)} dew pt
              </div>
              <p className="text-xs font-mono text-slate-500 mt-2">
                Relative humidity {Math.round(weather.current.humidity)}% · Temp/Dew spread {Math.round(Math.abs(weather.current.temperatureF - weather.current.dewPointF))}°F
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Comfort Gauge</div>
              <div className="mt-3">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${comfort.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1.5">
                  <span>Harsh</span>
                  <span>Comfort Index: {comfort.score}/100</span>
                  <span>Ideal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'air-quality' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">US EPA Air Quality Index</span>
                <div className="text-2xl font-mono font-semibold text-slate-900 mt-1">
                  {Math.round(aq.usAqi)} US AQI · {aq.category}
                </div>
                <p className="text-sm text-slate-600 mt-1">{aq.guidance}</p>
              </div>
              <div className="text-xs font-mono text-slate-500">
                European AQI: {Math.round(aq.euAqi)}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {[
                { label: 'PM2.5', value: `${aq.pm25.toFixed(1)} µg/m³` },
                { label: 'PM10', value: `${aq.pm10.toFixed(1)} µg/m³` },
                { label: 'Ozone (O₃)', value: `${Math.round(aq.ozone)} µg/m³` },
                { label: 'NO₂', value: `${aq.no2.toFixed(1)} µg/m³` },
                { label: 'SO₂', value: `${aq.so2.toFixed(1)} µg/m³` },
                { label: 'CO', value: `${Math.round(aq.co)} µg/m³` },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-medium">{item.label}</div>
                  <div className="text-sm font-mono font-semibold text-slate-900 mt-1">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'models' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-3 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">24h Model Consensus</div>
                <div className="text-lg font-semibold text-slate-900 mt-0.5">{consensus.agreementLabel}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Blend Mean</div>
                <div className="text-lg font-mono font-semibold text-slate-900 mt-0.5">
                  {formatTemp(consensus.blendAvgF, unit)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">NOAA GFS Seamless</div>
                <div className="text-lg font-mono font-semibold text-slate-900 mt-0.5">
                  {formatTemp(consensus.gfsAvgF, unit)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">ECMWF IFS 0.25°</div>
                <div className="text-lg font-mono font-semibold text-slate-900 mt-0.5">
                  {formatTemp(consensus.ecmwfAvgF, unit)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="font-medium">Hour</th>
                    <th className="font-medium text-right">Blend Temp</th>
                    <th className="font-medium text-right">GFS Temp</th>
                    <th className="font-medium text-right">ECMWF Temp</th>
                    <th className="font-medium text-right">Model Spread</th>
                    <th className="font-medium text-right">GFS / ECMWF Pop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {weather.hourly.slice(0, 8).map((h) => {
                    const spread =
                      h.gfsTempF !== null && h.ecmwfTempF !== null
                        ? Math.abs(h.gfsTempF - h.ecmwfTempF).toFixed(1)
                        : '—';
                    return (
                      <tr key={h.time} className="hover:bg-slate-50">
                        <td className="text-slate-700 font-sans font-medium">{formatHourLabel(h.time)}</td>
                        <td className="text-right text-slate-900">{formatTemp(h.temperatureF, unit)}</td>
                        <td className="text-right text-slate-600">
                          {h.gfsTempF !== null ? formatTemp(h.gfsTempF, unit) : '—'}
                        </td>
                        <td className="text-right text-slate-600">
                          {h.ecmwfTempF !== null ? formatTemp(h.ecmwfTempF, unit) : '—'}
                        </td>
                        <td className="text-right text-slate-600">{spread === '—' ? '—' : `${spread}°F`}</td>
                        <td className="text-right text-slate-600">
                          {h.gfsPrecipProb ?? '—'}% / {h.ecmwfPrecipProb ?? '—'}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
