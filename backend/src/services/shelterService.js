import { db } from "../config/db.js";
import { fetchEvacuationPoisNear } from "./evacuationPoiService.js";

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Fallback evacuation sites when DB and OSM return few results. */
const DEFAULT_SHELTERS = [
  { name: "Seattle Center Community Shelter", lat: 47.6205, lng: -122.3493, category: "shelter" },
  { name: "Bellevue Emergency Shelter", lat: 47.6101, lng: -122.2015, category: "shelter" },
  { name: "Tacoma South Shelter", lat: 47.2529, lng: -122.4443, category: "shelter" },
  { name: "Everett North Shelter", lat: 47.978, lng: -122.2021, category: "shelter" },
  { name: "LA Convention Center Shelter", lat: 34.0407, lng: -118.2698, category: "shelter" },
  { name: "Pasadena Community Shelter", lat: 34.1478, lng: -118.1445, category: "shelter" },
  { name: "Santa Monica Emergency Shelter", lat: 34.0195, lng: -118.4912, category: "shelter" }
];

function dedupeSites(sites) {
  const seen = new Set();
  return sites.filter((site) => {
    const key = `${site.name.toLowerCase().slice(0, 48)}@${site.lat.toFixed(4)},${site.lng.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadDatabaseShelters() {
  try {
    const snapshot = await db.query(
      `
        SELECT id, name, lat, lng, capacity, current_occupancy, pet_friendly, medical_support, updated_at
        FROM shelters
        ORDER BY updated_at DESC
        LIMIT 100
      `
    );
    return snapshot.rows.map((row) => ({
      id: row.id,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      capacity: row.capacity,
      currentOccupancy: row.current_occupancy,
      petFriendly: row.pet_friendly,
      medicalSupport: row.medical_support,
      updatedAt: row.updated_at,
      category: "shelter",
      source: "database"
    }));
  } catch {
    return [];
  }
}

/**
 * Nearest evacuation destinations: DB shelters + OSM police/fire/schools + defaults.
 */
export async function listSheltersNear(lat, lng, limit = 25) {
  const [dbShelters, osmPois] = await Promise.all([
    loadDatabaseShelters(),
    Number.isFinite(lat) && Number.isFinite(lng) ? fetchEvacuationPoisNear(lat, lng, 30) : []
  ]);

  const defaults = DEFAULT_SHELTERS.map((s, index) => ({
    id: `default-${index}`,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    category: s.category ?? "shelter",
    source: "default"
  }));

  const merged = dedupeSites([...dbShelters, ...osmPois, ...defaults]);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    for (const site of merged) {
      site.distanceKm = Number(haversineKm({ lat, lng }, site).toFixed(2));
    }
    merged.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return merged.slice(0, limit);
}

export function sheltersToDestinations(shelters) {
  return shelters.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    name: s.category ? `${s.name} (${formatCategory(s.category)})` : s.name,
    trafficFactor: s.category === "school" || s.category === "university" ? 1.05 : 1.0
  }));
}

function formatCategory(category) {
  switch (category) {
    case "police":
      return "Police";
    case "fire_department":
      return "Fire Dept";
    case "school":
      return "School";
    case "university":
      return "University";
    case "shelter":
    default:
      return "Shelter";
  }
}
