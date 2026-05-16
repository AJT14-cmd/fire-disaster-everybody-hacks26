import { useEffect, useState } from "react";
import { api } from "../api/client";
import { FireMap } from "../components/FireMap";

export function LiveMap() {
  const [center, setCenter] = useState({ lat: 34.0522, lng: -118.2437 });
  const [fires, setFires] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCenter({ lat, lng });
      try {
        const { data } = await api.get("/fire/intelligence", { params: { lat, lng } });
        setFires(data.activeFires ?? []);
      } catch {
        /* ignore */
      }
    });
  }, []);

  return (
    <div className="page">
      <h1>Live Fire Map</h1>
      <p className="muted">OpenStreetMap · red zone = elevated danger</p>
      <FireMap
        center={center}
        userPosition={center}
        dangerCenter={{ lat: center.lat + 0.05, lng: center.lng - 0.05 }}
      />
      <div className="panel">
        <strong>Active fire detections nearby: {fires.length}</strong>
      </div>
    </div>
  );
}
