export type TempUnit = 'F' | 'C';

export type WeatherConditionKind =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface GeoLocationResult {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
}

export interface HourlyPoint {
  time: string;
  temperatureF: number;
  apparentF: number;
  dewPointF: number;
  humidity: number;
  precipProb: number;
  precipIn: number;
  rainIn: number;
  snowIn: number;
  weatherCode: number;
  cloudCover: number;
  cloudLow: number;
  cloudMid: number;
  cloudHigh: number;
  pressureHpa: number;
  visibilityFt: number;
  windMph: number;
  windGustMph: number;
  windDir: number;
  uvIndex: number;
  solarRadWm2: number;
  capeJkg: number;
  freezingLevelFt: number;
  soilMoisture: number;
  gfsTempF: number | null;
  ecmwfTempF: number | null;
  gfsPrecipProb: number | null;
  ecmwfPrecipProb: number | null;
}

export interface DailyPoint {
  date: string;
  weatherCode: number;
  tempMaxF: number;
  tempMinF: number;
  apparentMaxF: number;
  apparentMinF: number;
  sunrise: string;
  sunset: string;
  daylightSec: number;
  uvIndexMax: number;
  precipSumIn: number;
  snowSumIn: number;
  precipProbMax: number;
  windMaxMph: number;
  windGustMaxMph: number;
  windDirDom: number;
  solarMjM2: number;
}

export interface AirQualityData {
  usAqi: number;
  euAqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
  co: number;
  category: string;
  guidance: string;
}

export interface NwsAlert {
  id: string;
  event: string;
  severity: string;
  urgency: string;
  headline: string;
  description: string;
  expires: string | null;
}

export interface WeatherBundle {
  source: 'live' | 'fallback';
  fetchedAt: string;
  location: GeoLocationResult;
  timezoneAbbrev: string;
  utcOffsetSeconds: number;
  current: {
    time: string;
    temperatureF: number;
    apparentF: number;
    humidity: number;
    dewPointF: number;
    precipIn: number;
    weatherCode: number;
    cloudCover: number;
    pressureHpa: number;
    surfacePressureHpa: number;
    windMph: number;
    windDir: number;
    windGustMph: number;
    uvIndex: number;
    visibilityFt: number;
    isDay: boolean;
  };
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  airQuality: AirQualityData;
  alerts: NwsAlert[];
}

export const PRESET_CITIES: GeoLocationResult[] = [
  { name: 'Boston', admin1: 'Massachusetts', country: 'United States', latitude: 42.3601, longitude: -71.0589, elevation: 9, timezone: 'America/New_York' },
  { name: 'New York', admin1: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, elevation: 10, timezone: 'America/New_York' },
  { name: 'Miami', admin1: 'Florida', country: 'United States', latitude: 25.7617, longitude: -80.1918, elevation: 2, timezone: 'America/New_York' },
  { name: 'Denver', admin1: 'Colorado', country: 'United States', latitude: 39.7392, longitude: -104.9903, elevation: 1609, timezone: 'America/Denver' },
  { name: 'Seattle', admin1: 'Washington', country: 'United States', latitude: 47.6062, longitude: -122.3321, elevation: 56, timezone: 'America/Los_Angeles' },
  { name: 'Chicago', admin1: 'Illinois', country: 'United States', latitude: 41.8781, longitude: -87.6298, elevation: 182, timezone: 'America/Chicago' },
];

export function decodeWmoCode(code: number): { label: string; kind: WeatherConditionKind; detail: string } {
  if (code === 0) return { label: 'Clear Sky', kind: 'clear', detail: 'Unobstructed sunshine and clear atmospheric visibility' };
  if (code === 1) return { label: 'Mainly Clear', kind: 'clear', detail: 'Isolated high wisps with bright skies' };
  if (code === 2) return { label: 'Partly Cloudy', kind: 'partly-cloudy', detail: 'Scattered cumulus breaks with filtered sun' };
  if (code === 3) return { label: 'Overcast', kind: 'cloudy', detail: 'Uniform cloud deck across the boundary layer' };
  if (code === 45 || code === 48) return { label: 'Fog & Mist', kind: 'fog', detail: 'Reduced surface visibility near saturation' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', kind: 'rain', detail: 'Fine low-cloud precipitation at light intensity' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    const heavy = [65, 82].includes(code);
    return {
      label: heavy ? 'Heavy Rain' : code >= 80 ? 'Rain Showers' : 'Rain',
      kind: 'rain',
      detail: heavy ? 'Sustained moderate-to-heavy rainfall rates' : 'Active rain bands passing through the area',
    };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: code === 75 || code === 86 ? 'Heavy Snow' : 'Snow', kind: 'snow', detail: 'Frozen precipitation with sub-freezing column support' };
  }
  if ([95, 96, 99].includes(code)) {
    return { label: 'Thunderstorms', kind: 'thunderstorm', detail: 'Convective updrafts with lightning and gust risk' };
  }
  return { label: 'Variable Sky', kind: 'partly-cloudy', detail: 'Changing regional cloud and boundary conditions' };
}

export function formatTemp(tempF: number, unit: TempUnit, includeUnit = true): string {
  const val = unit === 'C' ? ((tempF - 32) * 5) / 9 : tempF;
  const rounded = Math.round(val);
  return includeUnit ? `${rounded}°${unit}` : `${rounded}°`;
}

export function convertTempNumber(tempF: number, unit: TempUnit): number {
  return unit === 'C' ? Math.round((((tempF - 32) * 5) / 9) * 10) / 10 : Math.round(tempF * 10) / 10;
}

export function formatWind(mph: number, unit: TempUnit): string {
  if (unit === 'C') return `${Math.round(mph * 1.60934)} km/h`;
  return `${Math.round(mph)} mph`;
}

export function formatPressure(hpa: number, unit: TempUnit): string {
  if (unit === 'C') return `${Math.round(hpa)} hPa`;
  return `${(hpa * 0.02953).toFixed(2)} inHg`;
}

export function formatPrecip(inches: number, unit: TempUnit): string {
  if (unit === 'C') return `${(inches * 25.4).toFixed(1)} mm`;
  return `${inches.toFixed(2)} in`;
}

export function formatVisibility(ft: number, unit: TempUnit): string {
  const miles = ft / 5280;
  if (unit === 'C') return `${(miles * 1.60934).toFixed(1)} km`;
  return `${miles >= 10 ? Math.round(miles) : miles.toFixed(1)} mi`;
}

export function windCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return dirs[idx];
}

export function dewPointComfort(dewPointF: number): {
  level: string;
  score: number;
  summary: string;
  tone: 'nominal' | 'caution' | 'alert';
} {
  if (dewPointF < 35) return { level: 'Very Dry', score: 25, summary: 'Crisp desert-dry air; rapid evaporation and static.', tone: 'caution' };
  if (dewPointF < 50) return { level: 'Crisp & Refreshing', score: 92, summary: 'Ideal outdoor air with zero mugginess.', tone: 'nominal' };
  if (dewPointF < 60) return { level: 'Comfortable', score: 86, summary: 'Balanced moisture; pleasant for sustained activity.', tone: 'nominal' };
  if (dewPointF < 65) return { level: 'Slightly Sticky', score: 62, summary: 'Noticeable moisture during exertion in sun.', tone: 'caution' };
  if (dewPointF < 70) return { level: 'Muggy', score: 38, summary: 'Elevated humidity slows evaporative cooling.', tone: 'caution' };
  return { level: 'Oppressive', score: 15, summary: 'Tropical moisture load; heat stress risk rises quickly.', tone: 'alert' };
}

export function aqiDetails(usAqi: number): { category: string; guidance: string; tone: 'nominal' | 'caution' | 'alert' } {
  if (usAqi <= 50) return { category: 'Good', guidance: 'Clean air quality; unrestricted outdoor activity.', tone: 'nominal' };
  if (usAqi <= 100) return { category: 'Moderate', guidance: 'Acceptable air; sensitive groups watch prolonged exertion.', tone: 'caution' };
  if (usAqi <= 150) return { category: 'Sensitive Groups', guidance: 'Limit intense outdoor exertion for respiratory sensitivity.', tone: 'caution' };
  if (usAqi <= 200) return { category: 'Unhealthy', guidance: 'Reduce prolonged outdoor activity for all groups.', tone: 'alert' };
  return { category: 'Very Unhealthy', guidance: 'Keep strenuous activity indoors with filtered air.', tone: 'alert' };
}

export function pressureTrend(hourly: HourlyPoint[]): { label: string; deltaHpa: number } {
  if (hourly.length < 4) return { label: 'Steady', deltaHpa: 0 };
  const delta = hourly[3].pressureHpa - hourly[0].pressureHpa;
  if (delta >= 1.5) return { label: 'Rising', deltaHpa: Math.round(delta * 10) / 10 };
  if (delta <= -1.5) return { label: 'Falling', deltaHpa: Math.round(delta * 10) / 10 };
  return { label: 'Steady', deltaHpa: Math.round(delta * 10) / 10 };
}

export function scoreOutdoorHour(h: HourlyPoint, aqi = 35): number {
  let score = 100;
  // Comfort temperature band centered around 68F
  const tempDist = Math.abs(h.apparentF - 68);
  score -= Math.min(35, tempDist * 0.9);
  score -= h.precipProb * 0.55;
  if (h.precipIn > 0.01) score -= 25;
  if (h.windGustMph > 22) score -= Math.min(20, (h.windGustMph - 22) * 1.1);
  if (h.dewPointF > 66) score -= (h.dewPointF - 66) * 1.5;
  if (h.uvIndex > 8) score -= (h.uvIndex - 8) * 3;
  if (aqi > 100) score -= Math.min(25, (aqi - 100) * 0.4);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeBestWindows(hourly: HourlyPoint[], aqi: number): {
  bestHours: { time: string; score: number; tempF: number; windMph: number; precipProb: number }[];
  carWash: { rating: 'Prime Window' | 'Marginal' | 'Wait for Dry Spell'; dryStreakHours: number; nextRainTime: string | null; summary: string };
  snowFreeze: { frostHours: number; minTempF: number; totalSnowIn: number; riskLabel: 'None' | 'Frost Risk' | 'Freeze & Snow'; summary: string };
} {
  const next24 = hourly.slice(0, 24);
  const scored = next24.map((h) => ({
    time: h.time,
    score: scoreOutdoorHour(h, aqi),
    tempF: h.temperatureF,
    windMph: h.windMph,
    precipProb: h.precipProb,
  }));
  const bestHours = [...scored].sort((a, b) => b.score - a.score).slice(0, 4);

  const next48 = hourly.slice(0, 48);
  const firstRain = next48.findIndex((h) => h.precipProb >= 35 || h.precipIn >= 0.02);
  const dryStreakHours = firstRain === -1 ? next48.length : firstRain;
  const nextRainTime = firstRain > -1 ? next48[firstRain].time : null;
  let carWashRating: 'Prime Window' | 'Marginal' | 'Wait for Dry Spell' = 'Prime Window';
  let carWashSummary = `${dryStreakHours}+ dry hours ahead with low precip risk.`;
  if (dryStreakHours < 10) {
    carWashRating = 'Wait for Dry Spell';
    carWashSummary = `Rain chance rises within ${dryStreakHours} hours; hold off on washing.`;
  } else if (dryStreakHours < 24) {
    carWashRating = 'Marginal';
    carWashSummary = `Clean window for the next ${dryStreakHours} hours before wet weather arrives.`;
  }

  const frostHours = next48.filter((h) => h.temperatureF <= 34).length;
  const minTempF = next48.reduce((m, h) => Math.min(m, h.temperatureF), 999);
  const totalSnowIn = next48.reduce((s, h) => s + h.snowIn, 0);
  const riskLabel: 'None' | 'Frost Risk' | 'Freeze & Snow' =
    totalSnowIn >= 0.2 || minTempF <= 28 ? 'Freeze & Snow' : frostHours > 0 ? 'Frost Risk' : 'None';
  const snowSummary =
    riskLabel === 'None'
      ? `Temperatures hold above freezing (low ${Math.round(minTempF)}°F) across the next 48 hours.`
      : `${frostHours} sub-34°F hours expected; projected snow accumulation ${totalSnowIn.toFixed(1)} in.`;

  return {
    bestHours,
    carWash: { rating: carWashRating, dryStreakHours, nextRainTime, summary: carWashSummary },
    snowFreeze: { frostHours, minTempF, totalSnowIn, riskLabel, summary: snowSummary },
  };
}

export function computeSolarProgress(currentIso: string, sunriseIso: string, sunsetIso: string): {
  progress: number;
  isDaylight: boolean;
  daylightFormatted: string;
} {
  const now = new Date(currentIso).getTime();
  const rise = new Date(sunriseIso).getTime();
  const set = new Date(sunsetIso).getTime();
  const span = Math.max(1, set - rise);
  const daylightMinutes = Math.round(span / 60000);
  const hrs = Math.floor(daylightMinutes / 60);
  const mins = daylightMinutes % 60;
  const raw = (now - rise) / span;
  return {
    progress: Math.max(0, Math.min(1, raw)),
    isDaylight: raw >= 0 && raw <= 1,
    daylightFormatted: `${hrs}h ${mins}m`,
  };
}

export function computeModelConsensus(hourly: HourlyPoint[]): {
  agreementLabel: 'High Agreement' | 'Moderate Spread' | 'Divergent';
  avgSpreadF: number;
  maxSpreadF: number;
  gfsAvgF: number;
  ecmwfAvgF: number;
  blendAvgF: number;
} {
  const sample = hourly.slice(0, 24).filter((h) => h.gfsTempF !== null && h.ecmwfTempF !== null);
  if (!sample.length) {
    return {
      agreementLabel: 'High Agreement',
      avgSpreadF: 0,
      maxSpreadF: 0,
      gfsAvgF: hourly[0]?.temperatureF ?? 60,
      ecmwfAvgF: hourly[0]?.temperatureF ?? 60,
      blendAvgF: hourly[0]?.temperatureF ?? 60,
    };
  }
  const spreads = sample.map((h) => Math.abs((h.gfsTempF as number) - (h.ecmwfTempF as number)));
  const avgSpreadF = Math.round((spreads.reduce((a, b) => a + b, 0) / spreads.length) * 10) / 10;
  const maxSpreadF = Math.round(Math.max(...spreads) * 10) / 10;
  const gfsAvgF = Math.round((sample.reduce((a, h) => a + (h.gfsTempF as number), 0) / sample.length) * 10) / 10;
  const ecmwfAvgF = Math.round((sample.reduce((a, h) => a + (h.ecmwfTempF as number), 0) / sample.length) * 10) / 10;
  const blendAvgF = Math.round((sample.reduce((a, h) => a + h.temperatureF, 0) / sample.length) * 10) / 10;
  const agreementLabel = avgSpreadF <= 2.2 ? 'High Agreement' : avgSpreadF <= 4.5 ? 'Moderate Spread' : 'Divergent';
  return { agreementLabel, avgSpreadF, maxSpreadF, gfsAvgF, ecmwfAvgF, blendAvgF };
}

export function moonPhaseInfo(date = new Date()): { name: string; illuminationPct: number } {
  const synodicMonth = 29.53058867;
  const ref = Date.UTC(2000, 0, 6, 18, 14, 0);
  const daysSince = (date.getTime() - ref) / 86400000;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth;
  const illuminationPct = Math.round((1 - Math.cos(phase * 2 * Math.PI)) * 50);
  let name = 'Waning Crescent';
  if (phase < 0.0625 || phase >= 0.9375) name = 'New Moon';
  else if (phase < 0.1875) name = 'Waxing Crescent';
  else if (phase < 0.3125) name = 'First Quarter';
  else if (phase < 0.4375) name = 'Waxing Gibbous';
  else if (phase < 0.5625) name = 'Full Moon';
  else if (phase < 0.6875) name = 'Waning Gibbous';
  else if (phase < 0.8125) name = 'Last Quarter';
  return { name, illuminationPct };
}

export function formatHourLabel(iso: string): string {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return iso;
  const hr = Number(match[1]);
  if (hr === 0) return '12a';
  if (hr === 12) return '12p';
  return hr > 12 ? `${hr - 12}p` : `${hr}a`;
}

export function formatDayLabel(dateStr: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function formatClockTime(iso: string): string {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return iso;
  const hr = Number(match[1]);
  const min = match[2];
  const suffix = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${hr12}:${min} ${suffix}`;
}

export function getSeedWeather(location: GeoLocationResult = PRESET_CITIES[0]): WeatherBundle {
  const baseDate = new Date();
  baseDate.setMinutes(0, 0, 0);
  const baseTemp = location.name === 'Miami' ? 79 : location.name === 'Denver' ? 52 : location.name === 'Seattle' ? 51 : 54;
  const hourly: HourlyPoint[] = Array.from({ length: 48 }, (_, i) => {
    const dt = new Date(baseDate.getTime() + i * 3600000);
    const hr = dt.getHours();
    const diurnal = Math.sin(((hr - 9) / 24) * Math.PI * 2) * 8;
    const tempF = Math.round((baseTemp + diurnal) * 10) / 10;
    const isWet = i >= 18 && i <= 25;
    const cloudCover = isWet ? 85 : 28 + ((hr * 7) % 30);
    return {
      time: dt.toISOString().slice(0, 16),
      temperatureF: tempF,
      apparentF: Math.round((tempF - 2) * 10) / 10,
      dewPointF: Math.round((tempF - 12) * 10) / 10,
      humidity: isWet ? 78 : 54,
      precipProb: isWet ? 68 : 10,
      precipIn: isWet ? 0.06 : 0,
      rainIn: isWet ? 0.06 : 0,
      snowIn: 0,
      weatherCode: isWet ? 61 : 2,
      cloudCover,
      cloudLow: isWet ? 65 : 14,
      cloudMid: isWet ? 45 : 22,
      cloudHigh: 30,
      pressureHpa: Math.round((1018 - (isWet ? 4 : 0) + Math.sin(i / 6) * 2) * 10) / 10,
      visibilityFt: isWet ? 28000 : 52800,
      windMph: isWet ? 14 : 9,
      windGustMph: isWet ? 24 : 15,
      windDir: (220 + i * 5) % 360,
      uvIndex: hr >= 8 && hr <= 16 ? Math.max(1, Math.round(Math.sin(((hr - 7) / 10) * Math.PI) * 5)) : 0,
      solarRadWm2: hr >= 7 && hr <= 17 ? Math.round(Math.sin(((hr - 7) / 10) * Math.PI) * 520) : 0,
      capeJkg: isWet ? 340 : 45,
      freezingLevelFt: 8200,
      soilMoisture: 0.28,
      gfsTempF: Math.round((tempF + 1.1) * 10) / 10,
      ecmwfTempF: Math.round((tempF - 0.8) * 10) / 10,
      gfsPrecipProb: isWet ? 60 : 12,
      ecmwfPrecipProb: isWet ? 74 : 8,
    };
  });

  const daily: DailyPoint[] = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(baseDate.getTime() + i * 86400000);
    const isoDay = dt.toISOString().slice(0, 10);
    return {
      date: isoDay,
      weatherCode: i === 1 ? 61 : i % 2 === 0 ? 1 : 2,
      tempMaxF: Math.round(baseTemp + 9 - (i % 3) * 2),
      tempMinF: Math.round(baseTemp - 7 + (i % 2) * 2),
      apparentMaxF: Math.round(baseTemp + 8),
      apparentMinF: Math.round(baseTemp - 10),
      sunrise: `${isoDay}T06:42`,
      sunset: `${isoDay}T16:28`,
      daylightSec: 35160,
      uvIndexMax: 4 + (i % 3),
      precipSumIn: i === 1 ? 0.34 : 0.02,
      snowSumIn: 0,
      precipProbMax: i === 1 ? 72 : 18,
      windMaxMph: i === 1 ? 18 : 11,
      windGustMaxMph: i === 1 ? 28 : 17,
      windDirDom: 245,
      solarMjM2: 11.4,
    };
  });

  const first = hourly[0];
  return {
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
    location,
    timezoneAbbrev: 'LOCAL',
    utcOffsetSeconds: -18000,
    current: {
      time: first.time,
      temperatureF: first.temperatureF,
      apparentF: first.apparentF,
      humidity: first.humidity,
      dewPointF: first.dewPointF,
      precipIn: first.precipIn,
      weatherCode: first.weatherCode,
      cloudCover: first.cloudCover,
      pressureHpa: first.pressureHpa,
      surfacePressureHpa: first.pressureHpa - 1.2,
      windMph: first.windMph,
      windDir: first.windDir,
      windGustMph: first.windGustMph,
      uvIndex: first.uvIndex,
      visibilityFt: first.visibilityFt,
      isDay: true,
    },
    hourly,
    daily,
    airQuality: {
      usAqi: 34,
      euAqi: 26,
      pm25: 6.4,
      pm10: 14.2,
      ozone: 42,
      no2: 11.3,
      so2: 1.8,
      co: 210,
      category: 'Good',
      guidance: 'Clean air quality; unrestricted outdoor activity.',
    },
    alerts: [],
  };
}
