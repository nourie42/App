import { NextRequest, NextResponse } from 'next/server';
import {
  PRESET_CITIES,
  aqiDetails,
  getSeedWeather,
  type GeoLocationResult,
  type HourlyPoint,
  type DailyPoint,
  type NwsAlert,
  type WeatherBundle,
} from '@/lib/weather';

export const dynamic = 'force-dynamic';

async function fetchJson<T>(url: string, headers?: Record<string, string>, timeoutMs = 7000): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...headers },
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return (await res.json()) as T;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  if (query !== undefined && query !== null && query.length > 0) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
      const data = await fetchJson<{ results?: Array<Record<string, unknown>> }>(geoUrl);
      const results: GeoLocationResult[] = (data.results ?? []).map((r) => ({
        name: String(r.name ?? ''),
        admin1: r.admin1 ? String(r.admin1) : undefined,
        country: r.country ? String(r.country) : undefined,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        elevation: typeof r.elevation === 'number' ? r.elevation : undefined,
        timezone: r.timezone ? String(r.timezone) : undefined,
      }));
      return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      const q = query.toLowerCase();
      const results = PRESET_CITIES.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.admin1 ?? '').toLowerCase().includes(q)
      );
      return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
    }
  }

  const latParam = Number(searchParams.get('lat'));
  const lonParam = Number(searchParams.get('lon'));
  const hasCoords = Number.isFinite(latParam) && Number.isFinite(lonParam) && Math.abs(latParam) <= 90 && Math.abs(lonParam) <= 180;

  const location: GeoLocationResult = hasCoords
    ? {
        name: searchParams.get('name')?.slice(0, 80) || 'Custom Location',
        admin1: searchParams.get('admin1')?.slice(0, 80) || undefined,
        country: searchParams.get('country')?.slice(0, 80) || undefined,
        latitude: latParam,
        longitude: lonParam,
      }
    : PRESET_CITIES[0];

  try {
    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility,is_day` +
      `&hourly=temperature_2m,apparent_temperature,dew_point_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,snowfall,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,pressure_msl,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index,shortwave_radiation,cape,freezing_level_height,soil_moisture_0_to_1cm` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=7&timezone=auto`;

    const modelUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
      `&hourly=temperature_2m,precipitation_probability&models=gfs_seamless,ecmwf_ifs025&forecast_days=2&temperature_unit=fahrenheit&timezone=auto`;

    const aqiUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}` +
      `&current=us_aqi,european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide&timezone=auto`;

    const nwsUrl = `https://api.weather.gov/alerts/active?point=${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;

    const [forecastRes, modelRes, aqiRes, nwsRes] = await Promise.allSettled([
      fetchJson<Record<string, any>>(forecastUrl),
      fetchJson<Record<string, any>>(modelUrl),
      fetchJson<Record<string, any>>(aqiUrl),
      fetchJson<Record<string, any>>(nwsUrl, { 'User-Agent': 'WeatherNourieHorizon/1.0 (weather@nourie.local)' }, 4500),
    ]);

    if (forecastRes.status !== 'fulfilled') {
      throw new Error('Primary forecast unavailable');
    }

    const f = forecastRes.value;
    const m = modelRes.status === 'fulfilled' ? modelRes.value : null;
    const aq = aqiRes.status === 'fulfilled' ? aqiRes.value : null;
    const nws = nwsRes.status === 'fulfilled' ? nwsRes.value : null;

    const currentTimeStr = String(f.current?.time ?? '');
    const allTimes: string[] = Array.isArray(f.hourly?.time) ? f.hourly.time : [];
    const startIdx = Math.max(
      0,
      allTimes.findIndex((t) => t >= currentTimeStr.slice(0, 13))
    );

    const gfsTemps: Array<number | null> = m?.hourly?.temperature_2m_gfs_seamless ?? [];
    const ecmwfTemps: Array<number | null> = m?.hourly?.temperature_2m_ecmwf_ifs025 ?? [];
    const gfsPops: Array<number | null> = m?.hourly?.precipitation_probability_gfs_seamless ?? [];
    const ecmwfPops: Array<number | null> = m?.hourly?.precipitation_probability_ecmwf_ifs025 ?? [];
    const modelTimes: string[] = Array.isArray(m?.hourly?.time) ? m.hourly.time : [];
    const modelIdxByTime = new Map<string, number>();
    modelTimes.forEach((t, idx) => modelIdxByTime.set(t, idx));

    const hourly: HourlyPoint[] = allTimes.slice(startIdx, startIdx + 48).map((time) => {
      const i = allTimes.indexOf(time);
      const mi = modelIdxByTime.get(time);
      return {
        time,
        temperatureF: Number(f.hourly.temperature_2m?.[i] ?? 0),
        apparentF: Number(f.hourly.apparent_temperature?.[i] ?? 0),
        dewPointF: Number(f.hourly.dew_point_2m?.[i] ?? 0),
        humidity: Number(f.hourly.relative_humidity_2m?.[i] ?? 0),
        precipProb: Number(f.hourly.precipitation_probability?.[i] ?? 0),
        precipIn: Number(f.hourly.precipitation?.[i] ?? 0),
        rainIn: Number(f.hourly.rain?.[i] ?? 0),
        snowIn: Number(f.hourly.snowfall?.[i] ?? 0) * 0.393701,
        weatherCode: Number(f.hourly.weather_code?.[i] ?? 0),
        cloudCover: Number(f.hourly.cloud_cover?.[i] ?? 0),
        cloudLow: Number(f.hourly.cloud_cover_low?.[i] ?? 0),
        cloudMid: Number(f.hourly.cloud_cover_mid?.[i] ?? 0),
        cloudHigh: Number(f.hourly.cloud_cover_high?.[i] ?? 0),
        pressureHpa: Number(f.hourly.pressure_msl?.[i] ?? 1013),
        visibilityFt: Number(f.hourly.visibility?.[i] ?? 52800),
        windMph: Number(f.hourly.wind_speed_10m?.[i] ?? 0),
        windGustMph: Number(f.hourly.wind_gusts_10m?.[i] ?? 0),
        windDir: Number(f.hourly.wind_direction_10m?.[i] ?? 0),
        uvIndex: Number(f.hourly.uv_index?.[i] ?? 0),
        solarRadWm2: Number(f.hourly.shortwave_radiation?.[i] ?? 0),
        capeJkg: Number(f.hourly.cape?.[i] ?? 0),
        freezingLevelFt: Math.round(Number(f.hourly.freezing_level_height?.[i] ?? 2500) * 3.28084),
        soilMoisture: Number(f.hourly.soil_moisture_0_to_1cm?.[i] ?? 0.25),
        gfsTempF: mi !== undefined && typeof gfsTemps[mi] === 'number' ? gfsTemps[mi] : null,
        ecmwfTempF: mi !== undefined && typeof ecmwfTemps[mi] === 'number' ? ecmwfTemps[mi] : null,
        gfsPrecipProb: mi !== undefined && typeof gfsPops[mi] === 'number' ? gfsPops[mi] : null,
        ecmwfPrecipProb: mi !== undefined && typeof ecmwfPops[mi] === 'number' ? ecmwfPops[mi] : null,
      };
    });

    const dailyTimes: string[] = Array.isArray(f.daily?.time) ? f.daily.time : [];
    const daily: DailyPoint[] = dailyTimes.map((date, i) => ({
      date,
      weatherCode: Number(f.daily.weather_code?.[i] ?? 0),
      tempMaxF: Number(f.daily.temperature_2m_max?.[i] ?? 0),
      tempMinF: Number(f.daily.temperature_2m_min?.[i] ?? 0),
      apparentMaxF: Number(f.daily.apparent_temperature_max?.[i] ?? 0),
      apparentMinF: Number(f.daily.apparent_temperature_min?.[i] ?? 0),
      sunrise: String(f.daily.sunrise?.[i] ?? `${date}T06:30`),
      sunset: String(f.daily.sunset?.[i] ?? `${date}T17:30`),
      daylightSec: Number(f.daily.daylight_duration?.[i] ?? 36000),
      uvIndexMax: Number(f.daily.uv_index_max?.[i] ?? 0),
      precipSumIn: Number(f.daily.precipitation_sum?.[i] ?? 0),
      snowSumIn: Number(f.daily.snowfall_sum?.[i] ?? 0) * 0.393701,
      precipProbMax: Number(f.daily.precipitation_probability_max?.[i] ?? 0),
      windMaxMph: Number(f.daily.wind_speed_10m_max?.[i] ?? 0),
      windGustMaxMph: Number(f.daily.wind_gusts_10m_max?.[i] ?? 0),
      windDirDom: Number(f.daily.wind_direction_10m_dominant?.[i] ?? 0),
      solarMjM2: Number(f.daily.shortwave_radiation_sum?.[i] ?? 0),
    }));

    const usAqi = Number(aq?.current?.us_aqi ?? 32);
    const aqInfo = aqiDetails(usAqi);

    const alerts: NwsAlert[] = Array.isArray(nws?.features)
      ? nws.features.slice(0, 5).map((feat: any, idx: number) => ({
          id: String(feat.id ?? idx),
          event: String(feat.properties?.event ?? 'Weather Advisory'),
          severity: String(feat.properties?.severity ?? 'Moderate'),
          urgency: String(feat.properties?.urgency ?? 'Expected'),
          headline: String(feat.properties?.headline ?? feat.properties?.event ?? 'Active weather bulletin'),
          description: String(feat.properties?.description ?? '').slice(0, 600),
          expires: feat.properties?.expires ? String(feat.properties.expires) : null,
        }))
      : [];

    const bundle: WeatherBundle = {
      source: 'live',
      fetchedAt: new Date().toISOString(),
      location: {
        ...location,
        elevation: typeof f.elevation === 'number' ? Math.round(f.elevation) : location.elevation,
        timezone: typeof f.timezone === 'string' ? f.timezone : location.timezone,
      },
      timezoneAbbrev: String(f.timezone_abbreviation ?? 'LOCAL'),
      utcOffsetSeconds: Number(f.utc_offset_seconds ?? 0),
      current: {
        time: String(f.current?.time ?? ''),
        temperatureF: Number(f.current?.temperature_2m ?? 0),
        apparentF: Number(f.current?.apparent_temperature ?? 0),
        humidity: Number(f.current?.relative_humidity_2m ?? 0),
        dewPointF: Number(f.current?.dew_point_2m ?? 0),
        precipIn: Number(f.current?.precipitation ?? 0),
        weatherCode: Number(f.current?.weather_code ?? 0),
        cloudCover: Number(f.current?.cloud_cover ?? 0),
        pressureHpa: Number(f.current?.pressure_msl ?? 1013),
        surfacePressureHpa: Number(f.current?.surface_pressure ?? 1012),
        windMph: Number(f.current?.wind_speed_10m ?? 0),
        windDir: Number(f.current?.wind_direction_10m ?? 0),
        windGustMph: Number(f.current?.wind_gusts_10m ?? 0),
        uvIndex: Number(f.current?.uv_index ?? 0),
        visibilityFt: Number(f.current?.visibility ?? 52800),
        isDay: Number(f.current?.is_day ?? 1) === 1,
      },
      hourly,
      daily,
      airQuality: {
        usAqi,
        euAqi: Number(aq?.current?.european_aqi ?? 25),
        pm25: Number(aq?.current?.pm2_5 ?? 5.5),
        pm10: Number(aq?.current?.pm10 ?? 12.0),
        ozone: Number(aq?.current?.ozone ?? 40),
        no2: Number(aq?.current?.nitrogen_dioxide ?? 10),
        so2: Number(aq?.current?.sulphur_dioxide ?? 1.5),
        co: Number(aq?.current?.carbon_monoxide ?? 200),
        category: aqInfo.category,
        guidance: aqInfo.guidance,
      },
      alerts,
    };

    return NextResponse.json(bundle, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(getSeedWeather(location), { headers: { 'Cache-Control': 'no-store' } });
  }
}
