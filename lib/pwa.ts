import type { MetadataRoute } from 'next';

export type InstallPlatform = 'ios' | 'safari-mac' | 'chromium' | 'browser';

export function detectIOSUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  const isTraditionalIOS = /iphone|ipad|ipod/.test(ua);
  // iPadOS 13+ may report Macintosh with touch support; still guard cleanly via explicit UA check
  return isTraditionalIOS;
}

export function getInstallPlatform(userAgent: string): InstallPlatform {
  if (!userAgent) return 'browser';
  const ua = userAgent.toLowerCase();
  if (detectIOSUserAgent(ua)) return 'ios';
  if (/safari/.test(ua) && !/chrome|chromium|crios|edg|opr|fxios|firefox/.test(ua)) {
    return 'safari-mac';
  }
  if (/chrome|chromium|edg|opr/.test(ua)) {
    return 'chromium';
  }
  return 'browser';
}

export function isStandaloneDisplay(
  matchMediaStandalone: boolean,
  navigatorStandalone?: boolean
): boolean {
  return Boolean(matchMediaStandalone || navigatorStandalone === true);
}

export function buildManifestConfig(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Weather Nourie',
    short_name: 'NourieWx',
    description:
      'Live atmospheric telemetry, regional radar & wind flow, ECMWF vs GFS consensus, air quality, and outdoor planning windows.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f4f6fa',
    theme_color: '#0d2854',
    categories: ['weather', 'news', 'utilities'],
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Weather Nourie Home',
        short_name: 'Forecast',
        description: 'Live atmospheric telemetry, radar field, and 7-day forecast.',
        url: '/',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Experimental Weather',
        short_name: 'Experimental',
        description: 'Open Experimental Weather forecast workspace.',
        url: '/weather-fusion/experimental',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Weather Horizon',
        short_name: 'Horizon',
        description: 'Open Weather Nourie Horizon branch.',
        url: '/weather-fusion/experimental/horizon',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Deal Desk Workspace',
        short_name: 'Deal Desk',
        description: 'Open acquisition intake and dealer commission economics.',
        url: '/deal-desk',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
