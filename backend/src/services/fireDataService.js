import axios from "axios";
import { env } from "../config/env.js";

async function fetchNASAActiveFires(lat, lng) {
  if (!env.nasaFirmsApiKey) return [];
  // FIRMS returns global CSV rows; this MVP filters nearby points in-process.
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${env.nasaFirmsApiKey}/VIIRS_SNPP_NRT/world/1`;
  const { data } = await axios.get(url, { timeout: 10000 });
  const rows = String(data).split("\n").slice(1, 200);
  return rows
    .map((line) => line.split(","))
    .filter((cols) => cols.length > 3)
    .map((cols) => ({
      latitude: Number(cols[0]),
      longitude: Number(cols[1]),
      confidence: cols[8],
      frp: Number(cols[12] ?? 0)
    }))
    .filter((fire) => Math.abs(fire.latitude - lat) < 2 && Math.abs(fire.longitude - lng) < 2);
}

async function fetchOpenWeather(lat, lng) {
  if (!env.openWeatherApiKey) return {};
  const { data } = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: { lat, lon: lng, appid: env.openWeatherApiKey, units: "metric" },
    timeout: 10000
  });
  return data;
}

async function fetchNoaaAlerts(lat, lng) {
  try {
    const { data } = await axios.get("https://api.weather.gov/alerts/active", {
      params: { point: `${lat},${lng}` },
      headers: env.noaaToken ? { token: env.noaaToken } : {},
      timeout: 10000
    });
    return data?.features ?? [];
  } catch {
    return [];
  }
}

function deriveSmokeHeatRisk(fires, weather) {
  // Simple heuristic combining weather and fire radiative power.
  const windSpeed = weather?.wind?.speed ?? 0;
  const temp = weather?.main?.temp ?? 25;
  const fireIntensity = fires.reduce((acc, f) => acc + (f.frp || 0), 0);
  const heatIndex = Math.min(1, (temp - 18) / 25 + fireIntensity / 6000);
  const smokeRisk = Math.min(1, windSpeed / 15 + fireIntensity / 9000);
  return {
    heatIndex: Number(heatIndex.toFixed(3)),
    smokeRisk: Number(smokeRisk.toFixed(3))
  };
}

export async function getFireIntelligence(lat, lng) {
  // Pull parallel telemetry from fire and weather providers.
  const [fires, weather, noaaAlerts] = await Promise.all([
    fetchNASAActiveFires(lat, lng),
    fetchOpenWeather(lat, lng),
    fetchNoaaAlerts(lat, lng)
  ]);
  const derived = deriveSmokeHeatRisk(fires, weather);
  return {
    location: { lat, lng },
    activeFires: fires,
    weather: {
      temperatureC: weather?.main?.temp ?? null,
      humidityPct: weather?.main?.humidity ?? null,
      windSpeedMps: weather?.wind?.speed ?? null,
      windDeg: weather?.wind?.deg ?? null
    },
    ...derived,
    noaaAlerts: noaaAlerts.slice(0, 10).map((f) => ({
      id: f.id,
      event: f.properties?.event,
      severity: f.properties?.severity
    })),
    generatedAt: new Date().toISOString()
  };
}
