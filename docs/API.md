# FirePath AI API Documentation

Base URL: `/api`

## Health

- `GET /health`
  - Returns service health and timestamp.

## Auth

- `GET /auth/me`
  - Header: `Authorization: Bearer <jwt>`
  - Returns authenticated user profile.

- `POST /auth/register`
  - Body: `{ email, password, displayName? }`
  - Returns `{ token, user }`.

- `POST /auth/login`
  - Body: `{ email, password }`
  - Returns `{ token, user }`.

## Users

- `GET /users/profile`
  - Returns `{ displayName, evacuationPreferences, alertPhone }`.

- `PUT /users/profile`
  - Body: `{ displayName?, evacuationPreferences?, homeLocation?, alertPhone? }`
  - Updates user profile. `alertPhone` is stored for future SMS alerts (not sent yet).

## Fire Intelligence

- `GET /fire/intelligence?lat=34.1&lng=-118.2`
  - Aggregates NIFC WFIGS + NASA FIRMS + NOAA + OpenWeather.
  - Returns `confirmedIncidents` (NIFC WFIGS), `activeFires` (FIRMS heat anomalies), `firePerimeters`, weather, smoke proxy.

- `POST /assistant/chat`
  - Body: `{ "question": "...", "lat": 47.6, "lng": -122.3 }`
  - Returns contextual emergency guidance using live fire intel, shelters, and risk model.

- `POST /fire/predict`
  - Body:
    ```json
    {
      "latitude": 34.1,
      "longitude": -118.2,
      "temperature_c": 32.0,
      "humidity_pct": 16.0,
      "wind_speed_kph": 28.5,
      "vegetation_dryness_index": 0.81
    }
    ```
  - Calls AI microservice and returns risk score, spread direction, ETA.

- `GET /fire/shelters?lat=&lng=&limit=25`
  - Returns nearest evacuation sites: DB shelters, OpenStreetMap police/fire stations/schools, and defaults.
  - Each item includes `category`: `shelter`, `police`, `fire_department`, or `school`.

## Routes

- `POST /routes/evacuation`
  - Body: `{ origin, destinations, riskZones?, travelMode?: "driving" | "walking" }`
  - Returns safest shelter choice, ETA, distance, `travelMode`, and OSRM `geometry` polyline when available.
  - Routing provider: OpenStreetMap data via OSRM (`OSRM_BASE_URL`).

## Community

- `POST /community/report`
  - Body: `{ lat, lng, type, description, imageUrl? }`
  - Stores user-submitted fire/smoke sightings.

## Admin

- `GET /admin/dashboard`
  - Requires `admin` role in authenticated user record.
  - Returns platform metrics and incident stats.

## Integrations (Readiness)

- `POST /integrations/wearables/heartbeat`
  - Placeholder for Apple Watch / Wear OS telemetry.

- `POST /integrations/drone/camera-frame`
  - Placeholder for drone/fire camera image metadata pipeline.

## WebSocket Events

Socket path: same host via `ws`.

Server emits:

- `fire.update`: latest fire overlays/intelligence
- `route.recommendation`: newly computed safer route

Client emits:

- `subscribe.region`: `{ lat, lng, radiusKm }`
