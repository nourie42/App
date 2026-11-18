import type { Metadata } from 'next';
import { WeatherThemeShell } from '@/components/weather/WeatherThemeShell';

export const metadata: Metadata = {
  title: 'Weather Nourie · Experimental & Horizon Forecast',
  description:
    'High-density atmospheric telemetry, multi-model consensus, hourly instrumentation, and outdoor planning windows.',
};

export default function WeatherFusionLayout({ children }: { children: React.ReactNode }) {
  return <WeatherThemeShell>{children}</WeatherThemeShell>;
}
