# Maps & Routing (OpenStreetMap)

FirePath AI uses **OpenStreetMap** for map tiles and **OSRM** for road routing. No Google Maps API key is required.

## Mobile map tiles

- Component: `mobile/src/components/OpenStreetMapView.tsx`
- Tiles: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Attribution: `© OpenStreetMap contributors` (displayed in-app)

**Production note:** Do not rely on the public OSM tile server at scale. Host your own tiles or use a commercial OSM tile provider.

## Backend routing (OSRM)

- Service: `backend/src/services/osrmService.js`
- Env: `OSRM_BASE_URL` (default: `https://router.project-osrm.org`)
- Used by: `POST /api/routes/evacuation`

The public OSRM demo server is for development only. Self-host OSRM for production:

- [Project OSRM](https://project-osrm.org/)
- [OSRM Docker](https://hub.docker.com/r/osrm/osrm-backend/)

## Response shape

Evacuation routes may include a `geometry` array of `{ lat, lng }` points for map polylines.
