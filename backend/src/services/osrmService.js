import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Fetches a driving route from OSRM (OpenStreetMap-based routing).
 * Default public instance is for development only; self-host OSRM for production.
 */
export async function fetchOsrmRoute(origin, destination) {
  if (!origin || !destination) return null;

  const base = env.osrmBaseUrl.replace(/\/$/, "");
  const coordPath = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${base}/route/v1/driving/${coordPath}`;

  try {
    const { data } = await axios.get(url, {
      params: { overview: "full", geometries: "geojson", steps: false },
      timeout: 12000
    });

    if (data.code !== "Ok" || !data.routes?.length) {
      return null;
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng,
      latitude: lat,
      longitude: lng
    }));

    return {
      provider: "osrm",
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      etaMinutes: Math.max(1, Math.round(route.duration / 60)),
      geometry: coordinates
    };
  } catch (error) {
    logger.warn("OSRM routing failed:", error.message);
    return null;
  }
}
