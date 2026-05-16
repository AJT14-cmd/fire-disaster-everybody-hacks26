import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import {
  FireMap,
  type ConfirmedIncident,
  type FireDetection,
  type FirePerimeter
} from "../components/FireMap";

type Intelligence = {
  activeFires: FireDetection[];
  confirmedIncidents: ConfirmedIncident[];
  firePerimeters: FirePerimeter[];
  weather: {
    temperatureC: number | null;
    humidityPct: number | null;
    windSpeedMps: number | null;
    windDeg: number | null;
  };
  heatIndex: number;
  smokeRisk: number;
  noaaAlerts: { event?: string; severity?: string }[];
  generatedAt: string;
};

const DEFAULT_CENTER = { lat: 47.656, lng: -122.317 };

export function LiveMap() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [fires, setFires] = useState<FireDetection[]>([]);
  const [confirmed, setConfirmed] = useState<ConfirmedIncident[]>([]);
  const [perimeters, setPerimeters] = useState<FirePerimeter[]>([]);
  const [intel, setIntel] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIntelligence = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Intelligence>("/fire/intelligence", { params: { lat, lng } });
      setIntel(data);
      setFires(data.activeFires ?? []);
      setConfirmed(data.confirmedIncidents ?? []);
      setPerimeters(data.firePerimeters ?? []);
      setCenter({ lat, lng });
    } catch {
      setError("Could not load live fire data. Check login and backend.");
      setFires([]);
      setConfirmed([]);
      setPerimeters([]);
      setIntel(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      loadIntelligence(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => loadIntelligence(pos.coords.latitude, pos.coords.longitude),
      () => loadIntelligence(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, [loadIntelligence]);

  const windKph = intel?.weather?.windSpeedMps != null ? (intel.weather.windSpeedMps * 3.6).toFixed(1) : "—";

  return (
    <div className="page">
      <h1>Live Fire Map</h1>
      <p className="muted">
        NIFC WFIGS confirmed fires · NASA FIRMS heat anomalies · OpenWeather · NOAA alerts
        {intel?.generatedAt ? ` · Updated ${new Date(intel.generatedAt).toLocaleTimeString()}` : ""}
      </p>

      {loading && <p className="muted">Loading live data…</p>}
      {error && <p style={{ color: "#ff3b30" }}>{error}</p>}

      <ul className="muted map-legend" style={{ fontSize: "0.85rem", paddingLeft: "1.1rem" }}>
        <li>Red dot = confirmed wildfire incident (NIFC WFIGS)</li>
        <li>Orange pin = likely fire / VIIRS heat anomaly (NASA FIRMS)</li>
        <li>Red shaded area = official fire perimeter</li>
      </ul>

      <FireMap
        center={center}
        userPosition={center}
        fires={fires}
        confirmedIncidents={confirmed}
        firePerimeters={perimeters}
      />

      <div className="panel">
        <strong>Confirmed wildfires (NIFC WFIGS): {confirmed.length}</strong>
        {confirmed.length === 0 && !loading && (
          <p className="muted">No active confirmed incidents in this area.</p>
        )}
        {confirmed.length > 0 && (
          <ul className="muted" style={{ marginBottom: 0 }}>
            {confirmed.slice(0, 5).map((inc) => (
              <li key={String(inc.id ?? inc.name)}>
                {inc.name}
                {inc.acres != null ? ` — ${inc.acres.toLocaleString()} acres` : ""}
                {inc.percentContained != null ? ` (${inc.percentContained}% contained)` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <strong>Likely fires nearby (heat anomalies): {fires.length}</strong>
        {fires.length === 0 && !loading && (
          <p className="muted">
            No likely fire hotspots (VIIRS heat anomalies) in the last 3 days for this area.
          </p>
        )}
      </div>

      {intel && (
        <div className="panel">
          <strong>Live conditions</strong>
          <p className="muted">
            Temp: {intel.weather.temperatureC ?? "—"}°C · Humidity: {intel.weather.humidityPct ?? "—"}% ·
            Wind: {windKph} km/h
          </p>
          <p className="muted">
            Heat index: {(intel.heatIndex * 100).toFixed(0)}% · Smoke risk:{" "}
            {(intel.smokeRisk * 100).toFixed(0)}%
          </p>
          {intel.noaaAlerts.length > 0 && (
            <>
              <strong>NOAA alerts</strong>
              <ul className="muted">
                {intel.noaaAlerts.map((a, i) => (
                  <li key={i}>
                    {a.event} ({a.severity})
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className="emergency-btn accent"
        onClick={() => loadIntelligence(center.lat, center.lng)}
        disabled={loading}
      >
        Refresh live data
      </button>
    </div>
  );
}
