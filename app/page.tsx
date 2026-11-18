import { WeatherThemeShell } from '@/components/weather/WeatherThemeShell';
import { WeatherAppShell } from '@/components/weather/WeatherAppShell';

export default function HomePage() {
  return (
    <WeatherThemeShell>
      <WeatherAppShell mode="main" />
    </WeatherThemeShell>
  );
}
