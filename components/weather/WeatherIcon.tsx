import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';
import { decodeWmoCode } from '@/lib/weather';

export function WeatherIcon({
  code,
  isDay = true,
  className = 'w-5 h-5',
}: {
  code: number;
  isDay?: boolean;
  className?: string;
}) {
  const { kind } = decodeWmoCode(code);
  switch (kind) {
    case 'clear':
      return isDay ? (
        <Sun className={`${className} text-amber-500`} aria-hidden="true" />
      ) : (
        <Moon className={`${className} text-sky-300`} aria-hidden="true" />
      );
    case 'partly-cloudy':
      return <CloudSun className={`${className} text-amber-400`} aria-hidden="true" />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-400`} aria-hidden="true" />;
    case 'fog':
      return <CloudFog className={`${className} text-slate-400`} aria-hidden="true" />;
    case 'rain':
      return <CloudRain className={`${className} text-sky-500`} aria-hidden="true" />;
    case 'snow':
      return <CloudSnow className={`${className} text-cyan-400`} aria-hidden="true" />;
    case 'thunderstorm':
      return <CloudLightning className={`${className} text-indigo-500`} aria-hidden="true" />;
  }
}
