import axios from "axios";
import { logger } from "../utils/logger.js";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];
const REQUEST_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "User-Agent": "FirePathAI/1.0 (fire-disaster-evacuation)"
};
const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map();

function cacheKey(lat, lng, radiusKm) {
  return `${lat.toFixed(2)},${lng.toFixed(2)},${radiusKm}`;
}

function labelFromTags(tags, fallback) {
  const name = tags?.name?.trim();
  if (name) return name;
  return fallback;
}

function mapOverpassElement(element, category, fallbackLabel) {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: `osm-${category}-${element.type}-${element.id}`,
    name: labelFromTags(element.tags, fallbackLabel),
    lat,
    lng,
    category,
    source: "openstreetmap"
  };
}

/**
 * Fetch police, fire, schools, and universities near a point via Overpass API.
 */
export async function fetchEvacuationPoisNear(lat, lng, radiusKm = 25) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

  const key = cacheKey(lat, lng, radiusKm);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const radiusM = Math.round(radiusKm * 1000);
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="police"](around:${radiusM},${lat},${lng});
      way["amenity"="police"](around:${radiusM},${lat},${lng});
      node["amenity"="fire_station"](around:${radiusM},${lat},${lng});
      way["amenity"="fire_station"](around:${radiusM},${lat},${lng});
      node["amenity"="school"](around:${radiusM},${lat},${lng});
      way["amenity"="school"](around:${radiusM},${lat},${lng});
      node["amenity"="college"](around:${radiusM},${lat},${lng});
      way["amenity"="college"](around:${radiusM},${lat},${lng});
      node["amenity"="university"](around:${radiusM},${lat},${lng});
      way["amenity"="university"](around:${radiusM},${lat},${lng});
    );
    out center 80;
  `;

  let elements = [];
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const { data } = await axios.post(endpoint, query, {
        headers: REQUEST_HEADERS,
        timeout: 28000
      });
      elements = data?.elements ?? [];
      if (elements.length > 0) break;
    } catch (error) {
      logger.warn(`Overpass failed (${endpoint}):`, error.message);
    }
  }

  try {
    if (elements.length === 0) {
      return [];
    }

    const seen = new Set();
    const pois = [];

    for (const element of elements) {
      const amenity = element.tags?.amenity;
      let category = null;
      let fallback = "Evacuation site";

      if (amenity === "police") {
        category = "police";
        fallback = "Police Department";
      } else if (amenity === "fire_station") {
        category = "fire_department";
        fallback = "Fire Department";
      } else if (amenity === "university" || amenity === "college") {
        category = "university";
        fallback = "Public University";
      } else if (amenity === "school") {
        category = "school";
        fallback = "Public School";
      }

      if (!category) continue;

      const poi = mapOverpassElement(element, category, fallback);
      if (!poi) continue;

      const dedupeKey = `${poi.name.toLowerCase().slice(0, 40)}@${poi.lat.toFixed(4)},${poi.lng.toFixed(4)}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      pois.push(poi);
    }

    cache.set(key, { at: Date.now(), data: pois });
    return pois;
  } catch (error) {
    logger.warn("Overpass evacuation POI parse failed:", error.message);
    return [];
  }
}
