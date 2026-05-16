import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Public router.project-osrm.org only serves driving geometry for all profiles.
 * Walking must use a foot-capable host (e.g. openstreetmap.de routed-foot).
 */
const ROUTING_ENDPOINTS = {
  driving: [
    {
      base: () => env.osrmBaseUrl.replace(/\/$/, ""),
      profile: "driving"
    },
    {
      base: () => "https://routing.openstreetmap.de/routed-car",
      profile: "driving"
    }
  ],
  walking: [
    {
      base: () => "https://routing.openstreetmap.de/routed-foot",
      profile: "foot"
    }
  ]
};

export function normalizeTravelMode(mode) {
  return mode === "walking" ? "walking" : "driving";
}

export function travelModeSpeedKph(mode) {
  return normalizeTravelMode(mode) === "walking" ? 5 : 50;
}

function parseOsrmResponse(data, travelMode) {
  if (data.code !== "Ok" || !data.routes?.length) {
    return null;
  }

  const route = data.routes[0];
  const geometry = route.geometry.coordinates.map(([lng, lat]) => ({
    lat,
    lng,
    latitude: lat,
    longitude: lng
  }));

  const mode = normalizeTravelMode(travelMode);
  return {
    provider: "osrm",
    travelMode: mode,
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    etaMinutes: Math.max(1, Math.round(route.duration / 60)),
    geometry
  };
}

/**
 * Fetches a route from OSRM (OpenStreetMap-based routing).
 * Supports driving and walking (foot) profiles on appropriate hosts.
 */
export async function fetchOsrmRoute(origin, destination, travelMode = "driving") {
  if (!origin || !destination) return null;

  const mode = normalizeTravelMode(travelMode);
  const coordPath = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const requestConfig = {
    params: { overview: "full", geometries: "geojson", steps: false },
    timeout: 20000,
    headers: { "User-Agent": "FirePath-Evacuation/1.0" }
  };

  const endpoints = ROUTING_ENDPOINTS[mode];

  for (const endpoint of endpoints) {
    const base = endpoint.base().replace(/\/$/, "");
    const url = `${base}/route/v1/${endpoint.profile}/${coordPath}`;
    try {
      const { data } = await axios.get(url, requestConfig);
      const parsed = parseOsrmResponse(data, mode);
      if (parsed) {
        parsed.routingProvider = `osrm-${endpoint.profile}`;
        return parsed;
      }
    } catch (error) {
      logger.warn(`OSRM routing failed (${mode}, ${url}):`, error.message);
    }
  }

  return null;
}
