import { getFireIntelligence } from "./fireDataService.js";
import { getWildfirePrediction } from "./predictionService.js";
import { listSheltersNear } from "./shelterService.js";

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function classifyIntent(question) {
  const q = question.toLowerCase();

  if (/(danger|safe|risk|threat|worry|evacuate now|should i leave)/.test(q)) {
    return "danger";
  }
  if (/(shelter|nearest shelter|where.*go|evacuation center|safe place)/.test(q)) {
    return "shelter";
  }
  if (/(how long|eta|reach me|arrive|when.*fire|time until)/.test(q)) {
    return "eta";
  }
  if (/(pack|bring|prepare|evacuation kit|what should i)/.test(q)) {
    return "packing";
  }
  if (/(route|direction|drive|get to|navigate)/.test(q)) {
    return "route";
  }
  if (/(fire near|hotspot|detection|satellite|anomal|map|burning)/.test(q)) {
    return "fires";
  }
  if (/(weather|wind|humidity|smoke|heat|condition)/.test(q)) {
    return "weather";
  }
  return "general";
}

function riskLevel(score) {
  if (score >= 0.7) return { label: "HIGH", advice: "Evacuate now if authorities have issued orders, or prepare to leave immediately." };
  if (score >= 0.4) return { label: "MEDIUM", advice: "Stay alert, monitor official alerts, and be ready to evacuate with a go-bag packed." };
  return { label: "LOW", advice: "Conditions are calmer, but keep monitoring — wildfire risk can change quickly with wind." };
}

function buildPredictInput(lat, lng, intel) {
  const temp = intel.weather.temperatureC ?? 28;
  const humidity = intel.weather.humidityPct ?? 35;
  const windKph = (intel.weather.windSpeedMps ?? 5) * 3.6;
  const dryness = Math.min(1, Number((intel.heatIndex * 0.5 + intel.smokeRisk * 0.5).toFixed(2)));
  return {
    latitude: lat,
    longitude: lng,
    temperature_c: temp,
    humidity_pct: humidity,
    wind_speed_kph: windKph,
    vegetation_dryness_index: dryness || 0.6
  };
}

function nearestFireKm(lat, lng, fires) {
  if (!fires?.length) return null;
  return Math.min(...fires.map((f) => haversineKm({ lat, lng }, { lat: f.latitude, lng: f.longitude })));
}

function nearestIncidentKm(lat, lng, incidents) {
  if (!incidents?.length) return null;
  return Math.min(
    ...incidents.map((i) => haversineKm({ lat, lng }, { lat: i.latitude, lng: i.longitude }))
  );
}

function confirmedSummary(intel, lat, lng) {
  const count = intel.confirmedIncidents?.length ?? 0;
  if (count === 0) return "No confirmed active wildfires (NIFC WFIGS) in this area.";
  const nearest = nearestIncidentKm(lat, lng, intel.confirmedIncidents);
  const names = intel.confirmedIncidents
    .slice(0, 3)
    .map((i) => i.name)
    .join(", ");
  return `${count} confirmed incident${count === 1 ? "" : "s"} (NIFC WFIGS)${nearest != null ? `, closest ~${nearest.toFixed(1)} km` : ""}${names ? `: ${names}` : ""}.`;
}

function composeAnswer(intent, question, ctx) {
  const { risk, intel, shelter, lat, lng } = ctx;
  const pct = (risk.risk_score * 100).toFixed(1);
  const level = riskLevel(risk.risk_score);
  const fireCount = intel.activeFires?.length ?? 0;
  const confirmedCount = intel.confirmedIncidents?.length ?? 0;
  const nearestKm = nearestFireKm(lat, lng, intel.activeFires);
  const windKph = intel.weather.windSpeedMps != null ? (intel.weather.windSpeedMps * 3.6).toFixed(1) : "unknown";
  const wfigsLine = confirmedSummary(intel, lat, lng);

  switch (intent) {
    case "danger":
      return (
        `Based on your location and current conditions, wildfire risk is ${level.label} (${pct}% model score, ${(risk.confidence * 100).toFixed(0)}% confidence). ` +
        `${level.advice} ` +
        `${wfigsLine} ` +
        (fireCount > 0
          ? `NASA FIRMS shows ${fireCount} likely heat anomal${fireCount === 1 ? "y" : "ies"} within ~${nearestKm?.toFixed(1) ?? "?"} km (satellite only). `
          : "No VIIRS heat anomalies in the last 3 days. ") +
        (intel.noaaAlerts?.length
          ? `Active NOAA alert: ${intel.noaaAlerts[0].event} (${intel.noaaAlerts[0].severity}).`
          : "")
      ).trim();

    case "shelter":
      if (!shelter) {
        return "I could not find a safe evacuation site near you. Open the Routes page for police, fire, school, and shelter options, or follow official county evacuation orders.";
      }
      const dist = haversineKm({ lat, lng }, shelter).toFixed(1);
      return (
        `The nearest listed shelter is ${shelter.name}, about ${dist} km from your location ` +
        `(${shelter.lat.toFixed(4)}, ${shelter.lng.toFixed(4)}). ` +
        `Open Routes in the app to calculate a driving path. ` +
        `Current risk is ${level.label} (${pct}%) — ${level.advice}`
      );

    case "eta":
      return (
        `Our spread model estimates fire influence could reach your area in roughly ${risk.estimated_arrival_minutes} minutes ` +
        `if conditions worsen, with spread toward the ${risk.spread_direction}. ` +
        `This is a model estimate, not a guarantee. Current risk: ${pct}% (${level.label}). ` +
        (fireCount > 0
          ? `There are ${fireCount} satellite heat anomalies nearby; the closest is about ${nearestKm?.toFixed(1)} km away. `
          : "") +
        `${level.advice}`
      );

    case "packing":
      return (
        `For evacuation, pack essentials now: ID and documents, medications, phone chargers, cash, water, snacks, ` +
        `N95 masks for smoke, a flashlight, and pet supplies if needed. ` +
        `Wear sturdy shoes and long sleeves. ` +
        `Current risk near you is ${level.label} (${pct}%) with ${windKph} km/h winds — ` +
        `${level.advice}`
      );

    case "route":
      return (
        `Use the Routes tab to get a path to the nearest shelter from your GPS location. ` +
        (shelter ? `Nearest option: ${shelter.name} (~${haversineKm({ lat, lng }, shelter).toFixed(1)} km). ` : "") +
        `Avoid areas downwind of active heat anomalies when possible. ` +
        `Model spread direction: ${risk.spread_direction}. Risk: ${pct}% (${level.label}).`
      );

    case "fires":
      return (
        `${wfigsLine} ` +
        (fireCount > 0
          ? `NASA FIRMS also shows ${fireCount} VIIRS heat anomal${fireCount === 1 ? "y" : "ies"} (closest ~${nearestKm?.toFixed(1)} km) — these are not confirmed fires. `
          : `No VIIRS heat anomalies in the last 3 days. `) +
        `See the Live Map: red = NIFC confirmed wildfires, orange pins = FIRMS heat anomalies. Model risk: ${pct}% (${level.label}).`
      );

    case "weather":
      return (
        `Live conditions at your location: ${intel.weather.temperatureC ?? "—"}°C, ` +
        `humidity ${intel.weather.humidityPct ?? "—"}%, wind ${windKph} km/h. ` +
        `Heat stress index ${(intel.heatIndex * 100).toFixed(0)}%, smoke exposure proxy ${(intel.smokeRisk * 100).toFixed(0)}%. ` +
        `Wildfire risk model: ${pct}% (${level.label}). ${level.advice}`
      );

    default:
      return (
        `You asked: "${question}"\n\n` +
        `Here is what FirePath sees for your area: Risk ${level.label} (${pct}%, confidence ${(risk.confidence * 100).toFixed(0)}%). ` +
        `${confirmedCount} confirmed WFIGS incident${confirmedCount === 1 ? "" : "s"}, ${fireCount} VIIRS heat anomal${fireCount === 1 ? "y" : "ies"}, ` +
        `wind ${windKph} km/h, spread trend ${risk.spread_direction}, model ETA ${risk.estimated_arrival_minutes} min. ` +
        (shelter ? `Nearest shelter: ${shelter.name}. ` : "") +
        `${level.advice} For shelters and driving directions, use Routes; for live pins, use Live Map.`
      );
  }
}

export async function answerAssistantQuestion({ question, lat, lng }) {
  const trimmed = String(question ?? "").trim();
  if (!trimmed) {
    return { answer: "Please enter a question about fire risk, shelters, evacuation, or conditions near you." };
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { answer: "Location is required. Allow browser location access or open the map first." };
  }

  const [intel, shelters] = await Promise.all([
    getFireIntelligence(latitude, longitude),
    listSheltersNear(latitude, longitude, 1)
  ]);

  const predictInput = buildPredictInput(latitude, longitude, intel);
  const risk = await getWildfirePrediction(predictInput);
  const shelter = shelters[0] ?? null;
  const intent = classifyIntent(trimmed);

  const answer = composeAnswer(intent, trimmed, {
    risk,
    intel,
    shelter,
    lat: latitude,
    lng: longitude
  });

  return {
    answer,
    intent,
    context: {
      riskScore: risk.risk_score,
      riskLevel: riskLevel(risk.risk_score).label,
      activeAnomalies: intel.activeFires?.length ?? 0,
      confirmedIncidents: intel.confirmedIncidents?.length ?? 0,
      nearestShelter: shelter?.name ?? null
    }
  };
}
