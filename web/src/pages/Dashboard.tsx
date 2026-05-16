import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type RiskPrediction } from "../api/client";
import { RiskCard } from "../components/RiskCard";

const DEFAULT_RISK: RiskPrediction = {
  risk_score: 0.3,
  confidence: 0.6,
  spread_direction: "NE",
  estimated_arrival_minutes: 180
};

function getPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function Dashboard() {
  const [risk, setRisk] = useState<RiskPrediction>(DEFAULT_RISK);
  const [coords, setCoords] = useState({ lat: 34.0522, lng: -118.2437 });

  useEffect(() => {
    (async () => {
      try {
        const location = await getPosition().catch(() => coords);
        setCoords(location);
        const { data } = await api.post<RiskPrediction>("/fire/predict", {
          latitude: location.lat,
          longitude: location.lng,
          temperature_c: 32,
          humidity_pct: 18,
          wind_speed_kph: 26,
          vegetation_dryness_index: 0.81
        });
        setRisk(data);
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  return (
    <div className="page">
      <h1>Emergency Dashboard</h1>
      <RiskCard risk={risk} />
      <Link to="/app/map" className="emergency-btn warning" style={{ textAlign: "center" }}>
        Live Fire Map
      </Link>
      <Link to="/app/routes" className="emergency-btn accent" style={{ textAlign: "center" }}>
        Find Safe Route
      </Link>
      <Link to="/app/assistant" className="emergency-btn safe" style={{ textAlign: "center" }}>
        AI Safety Assistant
      </Link>
    </div>
  );
}
