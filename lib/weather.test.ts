import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeWmoCode,
  formatTemp,
  formatWind,
  formatPressure,
  windCompass,
  dewPointComfort,
  aqiDetails,
  computeBestWindows,
  computeSolarProgress,
  computeModelConsensus,
  getSeedWeather,
  PRESET_CITIES,
} from './weather';

test('decodeWmoCode classifies weather states accurately', () => {
  assert.equal(decodeWmoCode(0).kind, 'clear');
  assert.equal(decodeWmoCode(3).kind, 'cloudy');
  assert.equal(decodeWmoCode(63).kind, 'rain');
  assert.equal(decodeWmoCode(75).kind, 'snow');
  assert.equal(decodeWmoCode(95).kind, 'thunderstorm');
});

test('unit formatters convert F/C, mph/kmh, and hPa/inHg accurately', () => {
  assert.equal(formatTemp(68, 'F'), '68°F');
  assert.equal(formatTemp(68, 'C'), '20°C');
  assert.equal(formatWind(10, 'F'), '10 mph');
  assert.equal(formatWind(10, 'C'), '16 km/h');
  assert.equal(formatPressure(1016, 'C'), '1016 hPa');
  assert.equal(formatPressure(1016, 'F'), '30.00 inHg');
});

test('windCompass maps degrees to 16-point compass', () => {
  assert.equal(windCompass(0), 'N');
  assert.equal(windCompass(90), 'E');
  assert.equal(windCompass(180), 'S');
  assert.equal(windCompass(270), 'W');
  assert.equal(windCompass(360), 'N');
});

test('dewPointComfort and aqiDetails return structured non-hue-only labels', () => {
  assert.equal(dewPointComfort(45).level, 'Crisp & Refreshing');
  assert.equal(dewPointComfort(72).tone, 'alert');
  assert.equal(aqiDetails(28).category, 'Good');
  assert.equal(aqiDetails(165).tone, 'alert');
});

test('computeBestWindows identifies dry car wash window and outdoor score', () => {
  const seed = getSeedWeather(PRESET_CITIES[0]);
  const windows = computeBestWindows(seed.hourly, seed.airQuality.usAqi);
  assert.equal(windows.bestHours.length, 4);
  assert.ok(windows.bestHours[0].score >= windows.bestHours[1].score);
  assert.equal(windows.carWash.dryStreakHours, 18);
  assert.equal(windows.carWash.rating, 'Marginal');
  assert.equal(windows.snowFreeze.riskLabel, 'None');
});

test('computeSolarProgress clamps daylight ratio between 0 and 1', () => {
  const midday = computeSolarProgress('2026-11-18T12:00', '2026-11-18T06:00', '2026-11-18T18:00');
  assert.equal(midday.progress, 0.5);
  assert.equal(midday.isDaylight, true);
  assert.equal(midday.daylightFormatted, '12h 0m');

  const night = computeSolarProgress('2026-11-18T22:00', '2026-11-18T06:00', '2026-11-18T18:00');
  assert.equal(night.progress, 1);
  assert.equal(night.isDaylight, false);
});

test('computeModelConsensus calculates GFS vs ECMWF average spread', () => {
  const seed = getSeedWeather(PRESET_CITIES[0]);
  const consensus = computeModelConsensus(seed.hourly);
  assert.equal(consensus.agreementLabel, 'High Agreement');
  assert.ok(Math.abs(consensus.avgSpreadF - 1.9) < 0.05);
});
