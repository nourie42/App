import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import '@/app/weather-fusion/weather.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export function WeatherThemeShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`wf-root ${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      {children}
    </div>
  );
}
