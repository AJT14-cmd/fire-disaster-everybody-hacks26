import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { fetchWfigsIncidents, fetchWfigsPerimeters } from "./wfigsService.js";

function buildBoundingBox(lat, lng, paddingDeg = 2.5) {
  const west = Math.max(-180, lng - paddingDeg);
  const east = Math.min(180, lng + paddingDeg);
  const south = Math.max(-90, lat - paddingDeg);
  const north = Math.min(90, lat + paddingDeg);
  return `${west},${south},${east},${north}`;
}

async function fetchNASAActiveFires(lat, lng) {
  if (!env.nasaFirmsApiKey) {
    logger.warn("NASA_FIRMS_API_KEY not set — activeFires will be empty.");
    return [];
  }

  const area = buildBoundingBox(lat, lng);
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${env.nasaFirmsApiKey}/VIIRS_SNPP_NRT/${area}/3`;

  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const text = String(data).trim();
    if (!text || text.startsWith("<") || !text.includes("latitude")) {
      logger.warn("NASA FIRMS returned non-CSV response for area", area);
      return [];
    }

    const lines = text.split("\n").filter(Boolean);
    if (lines.length <= 1) return [];

    const fires = lines.slice(1).map((line) => {
      const cols = line.split(",");
      return {
        latitude: Number(cols[0]),
        longitude: Number(cols[1]),
        confidence: cols[9] ?? "unknown",
        frp: Number(cols[12] ?? 0),
        acq_date: cols[5],
        daynight: cols[13]
      };
    });

    return fires.filter((f) => Number.isFinite(f.latitude) && Number.isFinite(f.longitude));
  } catch (error) {
    logger.error("NASA FIRMS fetch failed:", error.message);
    return [];
  }
}

async function fetchOpenWeather(lat, lng) {
  if (!env.openWeatherApiKey) return {};
  try {
    const { data } = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { lat, lon: lng, appid: env.openWeatherApiKey, units: "metric" },
      timeout: 10000
    });
    return data;
  } catch (error) {
    logger.warn("OpenWeather fetch failed:", error.message);
    return {};
  }
}

async function fetchNoaaAlerts(lat, lng) {
  try {
    const { data } = await axios.get("https://api.weather.gov/alerts/active", {
      params: { point: `${lat},${lng}` },
      headers: { "User-Agent": env.noaaUserAgent, Accept: "application/geo+json" },
      timeout: 10000
    });
    return data?.features ?? [];
  } catch {
    return [];
  }
}

function deriveSmokeHeatRisk(fires, weather) {
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
  const [fires, confirmedIncidents, firePerimeters, weather, noaaAlerts] = await Promise.all([
    fetchNASAActiveFires(lat, lng),
    fetchWfigsIncidents(lat, lng),
    fetchWfigsPerimeters(lat, lng),
    fetchOpenWeather(lat, lng),
    fetchNoaaAlerts(lat, lng)
  ]);
  const derived = deriveSmokeHeatRisk(fires, weather);
  return {
    location: { lat, lng },
    activeFires: fires,
    confirmedIncidents,
    firePerimeters,
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
