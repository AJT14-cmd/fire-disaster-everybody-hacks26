import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

type LatLng = { lat: number; lng: number };

export function MapRecenter({ center, zoom }: { center: LatLng; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom ?? map.getZoom(), { animate: true });
  }, [center.lat, center.lng, zoom, map]);

  return null;
}

export function FitRouteBounds({ points }: { points: LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [points, map]);

  return null;
}
