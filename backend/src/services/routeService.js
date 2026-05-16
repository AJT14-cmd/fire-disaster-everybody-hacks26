import { fetchOsrmRoute, normalizeTravelMode, travelModeSpeedKph } from "./osrmService.js";

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a, b) {
  // Geodesic distance approximation for lat/lng points.
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function straightLineGeometry(origin, destination, travelMode = "driving", segments = 24) {
  const mode = normalizeTravelMode(travelMode);
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    points.push({
      lat: origin.lat + t * (destination.lat - origin.lat),
      lng: origin.lng + t * (destination.lng - origin.lng)
    });
  }
  // Walking fallback: slight offset so map line is visibly distinct if OSRM fails.
  if (mode === "walking" && points.length > 2) {
    return points.map((p, index) => {
      if (index === 0 || index === points.length - 1) return p;
      return {
        lat: p.lat + 0.00015 * Math.sin(index * 0.9),
        lng: p.lng + 0.00015 * Math.cos(index * 0.9)
      };
    });
  }
  return points;
}

function riskPenaltyForDestination(destination, riskZones = []) {
  // Risk zones contribute penalty based on proximity and severity.
  return riskZones.reduce((penalty, zone) => {
    const distance = haversineKm(destination, zone.center);
    if (distance <= zone.radiusKm) {
      return penalty + zone.severity * (1 - distance / Math.max(zone.radiusKm, 0.1));
    }
    return penalty;
  }, 0);
}

export async function computeBestEvacuationRoute({
  origin,
  destinations,
  riskZones = [],
  travelMode = "driving"
}) {
  const mode = normalizeTravelMode(travelMode);
  const speedKph = travelModeSpeedKph(mode);

  // Score is hybrid: travel time + wildfire exposure penalty.
  const scored = destinations.map((destination) => {
    const distanceKm = haversineKm(origin, destination);
    const riskPenalty = riskPenaltyForDestination(destination, riskZones);
    const trafficFactor = destination.trafficFactor ?? 1.0;
    const etaMinutes = (distanceKm / speedKph) * 60 * trafficFactor;
    const score = etaMinutes + riskPenalty * 60;
    return {
      destination,
      distanceKm: Number(distanceKm.toFixed(2)),
      etaMinutes: Math.round(etaMinutes),
      riskPenalty: Number(riskPenalty.toFixed(3)),
      score: Number(score.toFixed(2))
    };
  });

  scored.sort((a, b) => a.score - b.score);
  const best = scored[0] ?? null;

  let osrmRoute = null;
  if (best?.destination) {
    osrmRoute = await fetchOsrmRoute(origin, best.destination, mode);
    if (osrmRoute) {
      best.distanceKm = osrmRoute.distanceKm;
      best.etaMinutes = osrmRoute.etaMinutes;
      best.geometry = osrmRoute.geometry;
      best.routingProvider = osrmRoute.provider;
      best.travelMode = osrmRoute.travelMode;
    } else {
      best.geometry = straightLineGeometry(origin, best.destination, mode);
      best.routingProvider = "straight-line-fallback";
      best.travelMode = mode;
      best.etaMinutes = Math.max(
        1,
        Math.round((best.distanceKm / speedKph) * 60 * (best.destination.trafficFactor ?? 1))
      );
    }
  }

  return {
    best,
    alternatives: scored.slice(1, 3),
    travelMode: mode,
    routingProvider: osrmRoute?.provider ?? "heuristic",
    generatedAt: new Date().toISOString()
  };
}
