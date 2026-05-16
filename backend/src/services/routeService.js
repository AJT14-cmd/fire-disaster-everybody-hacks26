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

export function computeBestEvacuationRoute({ origin, destinations, riskZones = [] }) {
  // Score is hybrid: travel time + wildfire exposure penalty.
  const scored = destinations.map((destination) => {
    const distanceKm = haversineKm(origin, destination);
    const riskPenalty = riskPenaltyForDestination(destination, riskZones);
    const trafficFactor = destination.trafficFactor ?? 1.0;
    const etaMinutes = (distanceKm / 60) * 60 * trafficFactor;
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
  return {
    best: scored[0] ?? null,
    alternatives: scored.slice(1, 3),
    generatedAt: new Date().toISOString()
  };
}
