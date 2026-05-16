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

- `PUT /users/profile`
  - Body: `{ displayName, evacuationPreferences, emergencyContacts }`
  - Updates user profile and safety preferences.

- `GET /users/alerts/history`
  - Returns historical alerts sent to the user.

## Fire Intelligence

- `GET /fire/intelligence?lat=34.1&lng=-118.2`
  - Aggregates NASA FIRMS + NOAA + OpenWeather.
  - Returns active fires, wind data, smoke proxy, and risk overlay.

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

- `GET /fire/shelters`
  - Returns tracked shelters and occupancy metadata.

## Routes

- `POST /routes/evacuation`
  - Body: `{ origin, destinations, riskZones, roadClosures }`
  - Returns safest shelter choice, ETA, distance, and OSRM `geometry` polyline when available.
  - Routing provider: OpenStreetMap data via OSRM (`OSRM_BASE_URL`).

## Alerts

- `POST /alerts/send`
  - Body: `{ userId, severity, message, sendSms, sendPush }`
  - Sends Twilio SMS and/or push notification.

- `POST /alerts/im-safe`
  - Body: `{ userId, note }`
  - Broadcasts "I'm safe" to emergency contacts.

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
- `alert.urgent`: high-severity emergency warning

Client emits:

- `subscribe.region`: `{ lat, lng, radiusKm }`
- `ack.alert`: `{ alertId }`
