import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { FireMap } from "../components/FireMap";
import { getCurrentPosition } from "../lib/geolocation";

type LatLng = { lat: number; lng: number };
type TravelMode = "driving" | "walking";

type EvacuationSite = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  source?: string;
  distanceKm?: number;
};

type RouteResult = {
  destination?: { name?: string; lat: number; lng: number };
  etaMinutes?: number;
  distanceKm?: number;
  riskPenalty?: number;
  routingProvider?: string;
  travelMode?: TravelMode;
  geometry?: { lat: number; lng: number }[];
};

const NEARBY_SITES_LIMIT = 10;

export function Routes() {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [loading, setLoading] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbySites, setNearbySites] = useState<EvacuationSite[]>([]);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const loadOrigin = useCallback(async () => {
    setLocating(true);
    const position = await getCurrentPosition();
    setOrigin(position);
    setLocating(false);
    return position;
  }, []);

  const loadNearbySites = useCallback(async (position: LatLng): Promise<EvacuationSite[]> => {
    setLoadingSites(true);
    setSitesError(null);
    try {
      const { data } = await api.get<{ shelters: EvacuationSite[] }>("/fire/shelters", {
        params: { lat: position.lat, lng: position.lng, limit: NEARBY_SITES_LIMIT }
      });
      const shelters = data.shelters ?? [];
      setNearbySites(shelters);
      return shelters;
    } catch {
      setNearbySites([]);
      setSitesError("Could not load nearby evacuation sites.");
      return [];
    } finally {
      setLoadingSites(false);
    }
  }, []);

  useEffect(() => {
    loadOrigin();
  }, [loadOrigin]);

  useEffect(() => {
    if (!origin) return;
    loadNearbySites(origin);
  }, [origin, loadNearbySites]);

  async function computeRoute() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const position = origin ?? (await loadOrigin());
      const sites = await loadNearbySites(position);

      if (sites.length === 0) {
        setError("No evacuation sites found near your location.");
        return;
      }

      const chosen = selectedSiteId ? sites.find((s) => s.id === selectedSiteId) : null;
      const routeTargets = chosen ? [chosen] : sites;
      const destinations = routeTargets.map((s) => ({
        lat: s.lat,
        lng: s.lng,
        name: s.name,
        trafficFactor: 1.0
      }));

      const { data } = await api.post<{ best: RouteResult; travelMode?: TravelMode }>(
        "/routes/evacuation",
        {
          origin: position,
          destinations,
          riskZones: [],
          travelMode
        }
      );

      if (!data.best?.destination) {
        setError("Could not compute a route to a safe site.");
        return;
      }

      setResult({ ...data.best, travelMode: data.best.travelMode ?? data.travelMode ?? travelMode });
      localStorage.setItem("firepath_last_route", JSON.stringify(data.best));
    } catch {
      setError("Route calculation failed. Check that you are logged in and the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const mapCenter = origin ?? { lat: 47.656, lng: -122.317 };
  const routeLine = result?.geometry ?? [];
  const destination = result?.destination
    ? { lat: result.destination.lat, lng: result.destination.lng, name: result.destination.name }
    : undefined;
  const modeLabel = result?.travelMode === "walking" ? "Walking" : "Driving";
  const nearestSites = nearbySites.slice(0, NEARBY_SITES_LIMIT);
  const selectedSite = selectedSiteId
    ? nearestSites.find((s) => s.id === selectedSiteId)
    : undefined;

  return (
    <div className="page">
      <h1>Smart Evacuation Routing</h1>
      <p className="muted">
        Shelters, police & fire stations, schools, and universities from OpenStreetMap — routes via OSRM
      </p>

      {locating && <p className="muted">Getting your location…</p>}
      {origin && !locating && (
        <p className="muted">
          Your location: {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
        </p>
      )}

      <div className="panel sites-panel">
        <strong>Nearby evacuation sites</strong>
        {loadingSites && <p className="muted">Loading shelters and safe locations…</p>}
        {sitesError && <p style={{ color: "#ff3b30" }}>{sitesError}</p>}
        {!loadingSites && nearbySites.length === 0 && !sitesError && (
          <p className="muted">No sites loaded yet. Allow location access or refresh.</p>
        )}
        {!loadingSites && nearestSites.length > 0 && (
          <>
            <p className="muted" style={{ marginTop: "0.35rem" }}>
              Tap a site to route there, or leave unselected for the safest option
            </p>
            <ul className="sites-list">
              {nearestSites.map((site) => {
                const isSelected = selectedSiteId === site.id;
                return (
                  <li key={site.id}>
                    <button
                      type="button"
                      className={`site-row${isSelected ? " site-selected" : ""}`}
                      onClick={() => setSelectedSiteId(isSelected ? null : site.id)}
                      disabled={loading}
                    >
                      <span className="site-name">{site.name}</span>
                      {site.distanceKm != null && (
                        <span className="site-distance">{site.distanceKm} km</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="panel">
        <strong>Travel mode</strong>
        <div className="travel-mode-options">
          <label className="travel-mode-option">
            <input
              type="radio"
              name="travel-mode"
              value="driving"
              checked={travelMode === "driving"}
              onChange={() => setTravelMode("driving")}
              disabled={loading}
            />
            Driving (roads)
          </label>
          <label className="travel-mode-option">
            <input
              type="radio"
              name="travel-mode"
              value="walking"
              checked={travelMode === "walking"}
              onChange={() => setTravelMode("walking")}
              disabled={loading}
            />
            Walking (pedestrian paths)
          </label>
        </div>
      </div>

      <button
        type="button"
        className="emergency-btn accent"
        onClick={computeRoute}
        disabled={loading || locating || loadingSites}
      >
        {loading
          ? "Calculating…"
          : selectedSite
            ? `Route to ${selectedSite.name}`
            : `Calculate ${travelMode === "walking" ? "Walking" : "Driving"} Route`}
      </button>

      {origin && (
        <button
          type="button"
          className="emergency-btn secondary"
          style={{ marginTop: "0.5rem" }}
          onClick={() => loadNearbySites(origin)}
          disabled={loadingSites}
        >
          {loadingSites ? "Refreshing sites…" : "Refresh site list"}
        </button>
      )}

      {error && <p style={{ color: "#ff3b30" }}>{error}</p>}

      <FireMap
        center={mapCenter}
        userPosition={origin ?? undefined}
        destination={destination}
        route={routeLine}
        fitRoute={routeLine.length >= 2}
        zoom={12}
      />

      {result && (
        <div className="panel">
          <p>Mode: {modeLabel}</p>
          <p>Destination: {result.destination?.name ?? "Shelter"}</p>
          <p>ETA: {result.etaMinutes} min</p>
          <p>Distance: {result.distanceKm} km</p>
          <p>Risk penalty: {result.riskPenalty}</p>
          <p>Router: {result.routingProvider ?? "heuristic"}</p>
          {result.routingProvider === "straight-line-fallback" && (
            <p className="muted">
              {modeLabel} routing unavailable — showing direct path. Try again later or switch mode.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
