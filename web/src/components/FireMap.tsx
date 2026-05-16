import { useState } from "react";
import { GeoJSON, MapContainer, Marker, Polyline, Popup } from "react-leaflet";
import { DEFAULT_MAP_LAYER_ID } from "../lib/mapLayers";
import { confirmedFireIcon, fireDetectionIcon, shelterIcon, userLocationIcon } from "../lib/leafletIcons";
import { MapLayerSelector } from "./MapLayerSelector";
import { MapTileLayer } from "./MapTileLayer";
import { FitRouteBounds, MapRecenter } from "./MapViewport";

type LatLng = { lat: number; lng: number };

export type FireDetection = {
  latitude: number;
  longitude: number;
  confidence?: string;
  frp?: number;
  acq_date?: string;
};

export type ConfirmedIncident = {
  id?: string | number;
  name: string;
  latitude: number;
  longitude: number;
  acres?: number | null;
  percentContained?: number | null;
  discoveryDate?: string | null;
  incidentType?: string | null;
  fireCause?: string | null;
  state?: string | null;
};

export type FirePerimeter = {
  id?: string | number;
  name: string;
  acres?: number | null;
  percentContained?: number | null;
  discoveryDate?: string | null;
  geometry: { type: string; coordinates: unknown };
};

type RoutePoint = LatLng | { lat?: number; lng?: number; latitude?: number; longitude?: number };

type Props = {
  center: LatLng;
  zoom?: number;
  userPosition?: LatLng;
  destination?: LatLng & { name?: string };
  fires?: FireDetection[];
  confirmedIncidents?: ConfirmedIncident[];
  firePerimeters?: FirePerimeter[];
  route?: RoutePoint[];
  height?: string;
  fitRoute?: boolean;
};

function normalizePoint(point: RoutePoint): LatLng | null {
  const p = point as LatLng & { latitude?: number; longitude?: number };
  const lat = p.lat ?? p.latitude;
  const lng = p.lng ?? p.longitude;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat: lat as number, lng: lng as number };
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "n/a";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

const perimeterStyle = {
  color: "#ff3b30",
  weight: 2,
  fillColor: "#ff3b30",
  fillOpacity: 0.2
};

export function FireMap({
  center,
  zoom = 11,
  userPosition,
  destination,
  fires = [],
  confirmedIncidents = [],
  firePerimeters = [],
  route = [],
  height = "420px",
  fitRoute = false
}: Props) {
  const [baseLayerId, setBaseLayerId] = useState(DEFAULT_MAP_LAYER_ID);

  const routeCoords = route
    .map(normalizePoint)
    .filter((p): p is LatLng => p != null)
    .map((p) => [p.lat, p.lng] as [number, number]);

  const boundsPoints = [
    ...(userPosition ? [userPosition] : []),
    ...(destination ? [destination] : []),
    ...routeCoords.map(([lat, lng]) => ({ lat, lng })),
    ...confirmedIncidents.map((i) => ({ lat: i.latitude, lng: i.longitude }))
  ];

  return (
    <div>
      <div className="map-panel" style={{ height }}>
        <MapLayerSelector value={baseLayerId} onChange={setBaseLayerId} />
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <MapTileLayer layerId={baseLayerId} />
          {!fitRoute && <MapRecenter center={center} zoom={zoom} />}
          {fitRoute && boundsPoints.length >= 2 && <FitRouteBounds points={boundsPoints} />}
          {firePerimeters.map((perimeter) => (
            <GeoJSON
              key={`perimeter-${perimeter.id ?? perimeter.name}`}
              data={perimeter.geometry as GeoJSON.GeoJsonObject}
              style={perimeterStyle}
              onEachFeature={(_feature, layer) => {
                layer.bindPopup(
                  `<strong>${perimeter.name}</strong><br/>` +
                    `Official fire perimeter (NIFC WFIGS)<br/>` +
                    `Acres: ${perimeter.acres != null ? perimeter.acres.toFixed(1) : "n/a"}<br/>` +
                    `Contained: ${perimeter.percentContained != null ? `${perimeter.percentContained}%` : "n/a"}`
                );
              }}
            />
          ))}
          {userPosition && (
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={userLocationIcon}
              title="Your location"
            />
          )}
          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={shelterIcon}
              title={destination.name ?? "Shelter"}
            >
              <Popup>
                <strong>{destination.name ?? "Evacuation shelter"}</strong>
              </Popup>
            </Marker>
          )}
          {confirmedIncidents.map((incident) => (
            <Marker
              key={`wfigs-${incident.id ?? incident.name}-${incident.latitude}`}
              position={[incident.latitude, incident.longitude]}
              icon={confirmedFireIcon}
            >
              <Popup>
                <strong>{incident.name}</strong>
                <br />
                Active wildfire incident (NIFC WFIGS)
                <br />
                Acres: {incident.acres != null ? incident.acres.toLocaleString() : "n/a"}
                <br />
                Contained:{" "}
                {incident.percentContained != null ? `${incident.percentContained}%` : "n/a"}
                <br />
                Discovered: {formatDate(incident.discoveryDate)}
                {incident.state && (
                  <>
                    <br />
                    State: {incident.state}
                  </>
                )}
              </Popup>
            </Marker>
          ))}
          {fires.map((fire, index) => (
            <Marker
              key={`fire-${fire.latitude}-${fire.longitude}-${index}`}
              position={[fire.latitude, fire.longitude]}
              icon={fireDetectionIcon}
            >
              <Popup>
                <strong>Likely fire (heat anomaly)</strong>
                <br />
                <span className="muted" style={{ fontSize: "0.85em" }}>
                  VIIRS satellite heat anomaly — may not be a confirmed wildfire.
                </span>
                <br />
                FRP: {fire.frp ?? "n/a"} MW
                <br />
                Confidence: {fire.confidence ?? "n/a"}
                <br />
                Date: {fire.acq_date ?? "n/a"}
              </Popup>
            </Marker>
          ))}
          {routeCoords.length >= 2 && (
            <Polyline
              key={routeCoords.length}
              positions={routeCoords}
              pathOptions={{ color: "#0a84ff", weight: 6, opacity: 0.9, lineCap: "round" }}
            />
          )}
        </MapContainer>
      </div>
      <p className="map-attribution">
        © OpenStreetMap · Red = confirmed wildfires (NIFC WFIGS) · Orange pins = NASA FIRMS heat anomalies
      </p>
    </div>
  );
}
