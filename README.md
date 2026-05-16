# FirePath AI

Web-first wildfire safety and evacuation platform with:

- wildfire risk prediction (AI microservice),
- live map intelligence (fire, wind, smoke, shelters),
- safe evacuation route optimization,
- real-time push/SMS emergency alerts.

## Monorepo Structure

```txt
fire-disaster-everybody-hacks26/
  web/                   # React + Vite web app (primary UI)
  backend/               # Node.js + Express API + WebSocket + jobs
  ai-service/            # FastAPI wildfire prediction microservice
  mobile/                # Legacy Expo app (optional)
  docs/                  # API docs, schema docs, roadmap, scalability
  data/                  # mock and sample datasets
```

## Tech Stack

- **Frontend:** React, Vite, React Router, Leaflet (OpenStreetMap)
- **Backend:** Node.js, Express, WebSocket (`ws`), PostgreSQL (`pg`), Twilio
- **DB/Auth:** Self-hosted PostgreSQL + JWT auth
- **Maps:** OpenStreetMap tiles + OSRM routing (no API key)
- **Data Providers:** NASA FIRMS, NOAA, OpenWeather
- **AI:** FastAPI + scikit-learn
- **Deploy:** Vercel/static host (web), Render/Railway (backend + AI)

## Quick Start

### 1) Prerequisites

- Node.js 20+
- Python 3.11 or 3.12 (not 3.14 for scikit-learn wheels)
- Self-hosted PostgreSQL instance
- OpenWeather key, NOAA User-Agent string (see `backend/.env.example`)
- Optional: Twilio for SMS alerts

### 2) Install Dependencies

```bash
npm install
```

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r ai-service/requirements.txt
```

### 3) Environment Setup

Copy and fill:

- `backend/.env.example` -> `backend/.env`
- `web/.env.example` -> `web/.env`
- `ai-service/.env.example` -> `ai-service/.env`

### 4) Run Services

```bash
# terminal 1 — backend
npm run dev:backend
```

```bash
# terminal 2 — AI service
npm run dev:ai
```

```bash
# terminal 3 — web app (http://localhost:5173)
npm run dev:web
```

The Vite dev server proxies `/api` to `http://localhost:4000` when using default config.

## Key Endpoints

- Health: `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Fire intelligence: `GET /api/fire/intelligence`
- Predict risk: `POST /api/fire/predict`
- Safe route: `POST /api/routes/evacuation`
- Alerts: `POST /api/alerts/send`, `POST /api/alerts/im-safe`

Detailed docs: `docs/API.md`.

## Web App Pages

- Landing, Login/Register
- Dashboard, Live Fire Map, Evacuation Routes
- Emergency Alerts, AI Assistant, Contacts, Settings

## AI Training Pipeline

- Training script: `ai-service/train.py`
- Sample data: `ai-service/data/sample_training_data.csv`

## Security Notes

- Location payloads encrypted at rest before PostgreSQL write.
- Rate limiting on API routes.
- JWT authentication middleware.

## Deployment

See `docs/DEPLOYMENT.md`, `docs/MAPS.md`, `docs/SCALABILITY.md`.

## Disclaimer

This project is an MVP reference implementation for emergency tooling.  
Do not use as a sole life-safety system without certified data feeds, official agency integration, and operational validation.
