import { useState } from "react";
import { api } from "../api/client";
import { FireMap } from "../components/FireMap";

type RouteResult = {
  destination?: { name?: string; lat: number; lng: number };
  etaMinutes?: number;
  distanceKm?: number;
  riskPenalty?: number;
  routingProvider?: string;
  geometry?: { lat: number; lng: number }[];
};

export function Routes() {
  const [result, setResult] = useState<RouteResult | null>(null);
  const origin = { lat: 34.05, lng: -118.24 };

  async function computeRoute() {
    const { data } = await api.post("/routes/evacuation", {
      origin,
      destinations: [
        { lat: 34.0, lng: -118.1, name: "Shelter A", trafficFactor: 1.1 },
        { lat: 33.98, lng: -118.18, name: "Shelter B", trafficFactor: 0.95 }
      ],
      riskZones: [{ center: { lat: 34.1, lng: -118.3 }, radiusKm: 8, severity: 0.85 }]
    });
    setResult(data.best);
    localStorage.setItem("firepath_last_route", JSON.stringify(data.best));
  }

  const routeLine = result?.geometry ?? [];

  return (
    <div className="page">
      <h1>Smart Evacuation Routing</h1>
      <p className="muted">OpenStreetMap roads via OSRM</p>
      <button type="button" className="emergency-btn accent" onClick={computeRoute}>
        Calculate Safe Route
      </button>
      <FireMap center={origin} userPosition={origin} route={routeLine} />
      {result && (
        <div className="panel">
          <p>Destination: {result.destination?.name ?? "Shelter"}</p>
          <p>ETA: {result.etaMinutes} min</p>
          <p>Distance: {result.distanceKm} km</p>
          <p>Risk penalty: {result.riskPenalty}</p>
          <p>Router: {result.routingProvider ?? "heuristic"}</p>
        </div>
      )}
    </div>
  );
}
