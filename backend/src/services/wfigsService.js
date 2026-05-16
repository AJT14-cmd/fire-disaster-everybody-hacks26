import axios from "axios";
import { logger } from "../utils/logger.js";

const WFIGS_BASE =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services";

const INCIDENTS_URL = `${WFIGS_BASE}/WFIGS_Incident_Locations_Current/FeatureServer/0/query`;
const PERIMETERS_URL = `${WFIGS_BASE}/WFIGS_Interagency_Perimeters/FeatureServer/0/query`;

const INCIDENT_FIELDS = [
  "IncidentName",
  "IncidentSize",
  "PercentContained",
  "FireDiscoveryDateTime",
  "IncidentTypeCategory",
  "FireCause",
  "POOState",
  "IrwinID"
].join(",");

const PERIMETER_FIELDS = [
  "poly_IncidentName",
  "poly_Acres_AutoCalc",
  "attr_PercentContained",
  "attr_FireDiscoveryDateTime",
  "attr_FireOutDateTime",
  "attr_IncidentTypeCategory",
  "attr_POOState"
].join(",");

function buildEnvelope(lat, lng, paddingDeg = 2.5) {
  return {
    xmin: lng - paddingDeg,
    ymin: lat - paddingDeg,
    xmax: lng + paddingDeg,
    ymax: lat + paddingDeg,
    spatialReference: { wkid: 4326 }
  };
}

async function queryWfigs(url, { lat, lng, paddingDeg, where, outFields }) {
  const envelope = buildEnvelope(lat, lng, paddingDeg);
  try {
    const { data } = await axios.get(url, {
      params: {
        where: where ?? "1=1",
        geometry: JSON.stringify(envelope),
        geometryType: "esriGeometryEnvelope",
        inSR: 4326,
        spatialRel: "esriSpatialRelIntersects",
        outFields,
        returnGeometry: true,
        f: "geojson",
        resultRecordCount: 200
      },
      timeout: 20000
    });

    if (data?.error) {
      logger.warn("WFIGS query error:", data.error?.message ?? data.error);
      return [];
    }

    return data?.features ?? [];
  } catch (error) {
    logger.warn("WFIGS fetch failed:", error.message);
    return [];
  }
}

function epochMsToIso(value) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const ms = Number(value);
  return new Date(ms < 1e12 ? ms * 1000 : ms).toISOString();
}

function mapIncidentFeature(feature) {
  const [lng, lat] = feature.geometry?.coordinates ?? [];
  const p = feature.properties ?? {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: p.IrwinID ?? p.OBJECTID ?? feature.id,
    name: p.IncidentName ?? "Unknown incident",
    latitude: lat,
    longitude: lng,
    acres: p.IncidentSize ?? null,
    percentContained: p.PercentContained ?? null,
    discoveryDate: epochMsToIso(p.FireDiscoveryDateTime),
    incidentType: p.IncidentTypeCategory ?? null,
    fireCause: p.FireCause ?? null,
    state: p.POOState ?? null,
    source: "nifc-wfigs"
  };
}

function mapPerimeterFeature(feature) {
  const p = feature.properties ?? {};
  const geometry = feature.geometry;
  if (!geometry?.coordinates) return null;

  return {
    id: p.poly_IRWINID ?? p.GlobalID ?? feature.id,
    name: p.poly_IncidentName ?? p.attr_IncidentName ?? "Fire perimeter",
    acres: p.poly_Acres_AutoCalc ?? p.attr_IncidentSize ?? null,
    percentContained: p.attr_PercentContained ?? null,
    discoveryDate: epochMsToIso(p.attr_FireDiscoveryDateTime),
    incidentType: p.attr_IncidentTypeCategory ?? null,
    state: p.attr_POOState ?? null,
    geometry,
    source: "nifc-wfigs"
  };
}

/** Official active wildland fire incidents (NIFC WFIGS). */
export async function fetchWfigsIncidents(lat, lng, paddingDeg = 2.5) {
  const where =
    "(IncidentTypeCategory = 'WF' OR IncidentTypeCategory = 'FI') AND (IncidentName NOT LIKE '%RX%')";
  const features = await queryWfigs(INCIDENTS_URL, {
    lat,
    lng,
    paddingDeg,
    where,
    outFields: INCIDENT_FIELDS
  });

  return features.map(mapIncidentFeature).filter(Boolean);
}

/** Fire perimeters for incidents not yet declared out. */
export async function fetchWfigsPerimeters(lat, lng, paddingDeg = 2.5) {
  const where = "attr_FireOutDateTime IS NULL AND (attr_IncidentTypeCategory = 'WF' OR attr_IncidentTypeCategory = 'FI')";
  const features = await queryWfigs(PERIMETERS_URL, {
    lat,
    lng,
    paddingDeg,
    where,
    outFields: PERIMETER_FIELDS
  });

  const cutoffMs = Date.now() - 60 * 24 * 60 * 60 * 1000;
  return features
    .map(mapPerimeterFeature)
    .filter(Boolean)
    .filter((p) => p.discoveryDate && new Date(p.discoveryDate).getTime() >= cutoffMs)
    .sort((a, b) => new Date(b.discoveryDate).getTime() - new Date(a.discoveryDate).getTime())
    .slice(0, 15);
}
