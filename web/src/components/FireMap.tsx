import { Circle, MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

type LatLng = { lat: number; lng: number };

type Props = {
  center: LatLng;
  zoom?: number;
  userPosition?: LatLng;
  dangerCenter?: LatLng;
  route?: LatLng[];
  height?: string;
};

export function FireMap({
  center,
  zoom = 11,
  userPosition,
  dangerCenter,
  route = [],
  height = "420px"
}: Props) {
  const routeCoords = route.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div>
      <div className="map-panel" style={{ height }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPosition && (
            <Marker position={[userPosition.lat, userPosition.lng]} title="Your location" />
          )}
          {dangerCenter && (
            <Circle
              center={[dangerCenter.lat, dangerCenter.lng]}
              radius={4000}
              pathOptions={{ color: "#ff3b30", fillColor: "#ff3b30", fillOpacity: 0.25 }}
            />
          )}
          {routeCoords.length > 1 && (
            <Polyline positions={routeCoords} pathOptions={{ color: "#0a84ff", weight: 5 }} />
          )}
        </MapContainer>
      </div>
      <p className="map-attribution">© OpenStreetMap contributors</p>
    </div>
  );
}
