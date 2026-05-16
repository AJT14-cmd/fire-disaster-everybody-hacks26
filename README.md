# FirePath AI

Mobile-first wildfire safety and evacuation platform with:

- wildfire risk prediction (AI microservice),
- live map intelligence (fire, wind, smoke, shelters),
- safe evacuation route optimization,
- real-time push/SMS emergency alerts.

## Monorepo Structure

```txt
fire-disaster-everybody-hacks26/
  mobile/                # React Native + Expo app
  backend/               # Node.js + Express API + WebSocket + jobs
  ai-service/            # FastAPI wildfire prediction microservice
  docs/                  # API docs, schema docs, roadmap, scalability
  data/                  # mock and sample datasets
```

## Tech Stack

- **Frontend:** React Native, Expo, React Navigation
- **Backend:** Node.js, Express, WebSocket (`ws`), PostgreSQL (`pg`), Twilio
- **DB/Auth:** Self-hosted PostgreSQL + JWT auth
- **Maps:** OpenStreetMap tiles + OSRM routing (no API key)
- **Data Providers:** NASA FIRMS, NOAA, OpenWeather
- **AI:** FastAPI + scikit-learn
- **Deploy:** Vercel (mobile web assets/backend), Render/Railway (AI service)

## Quick Start

### 1) Prerequisites

- Node.js 20+
- Python 3.11+
- Self-hosted PostgreSQL instance
- Twilio account and phone number
- OpenWeather key, NOAA User-Agent string (see backend `.env.example`)
- Optional: self-hosted OSRM URL (`OSRM_BASE_URL`) for production routing

### 2) Install Dependencies

```bash
npm install
npm --workspace backend install
npm --workspace mobile install
```

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r ai-service/requirements.txt
```

### 3) Environment Setup

Copy and fill:

- `backend/.env.example` -> `backend/.env`
- `mobile/.env.example` -> `mobile/.env`
- `ai-service/.env.example` -> `ai-service/.env`

### 4) Run Services

```bash
# backend
npm run dev:backend
```

```bash
# mobile
npm run dev:mobile
```

```bash
# ai service
npm run dev:ai
```

## Key Endpoints

- Health: `GET /api/health`
- Auth profile: `GET /api/auth/me`
- Fire intelligence: `GET /api/fire/intelligence`
- Predict risk: `POST /api/fire/predict`
- Safe route: `POST /api/routes/evacuation`
- Alerts: `POST /api/alerts/send`, `POST /api/alerts/im-safe`

Detailed docs: `docs/API.md`.

## AI Training Pipeline

- Training script: `ai-service/train.py`
- Feature engineering: `ai-service/app/preprocessing.py`
- Model inference: `ai-service/app/model.py`
- Sample data: `ai-service/data/sample_training_data.csv`

## Security Notes

- Location payloads encrypted at rest before PostgreSQL write.
- Rate limiting on API routes.
- JWT authentication middleware.
- All secrets are environment variables.

## Deployment

See:

- `docs/DEPLOYMENT.md`
- `docs/MAPS.md`
- `docs/SCALABILITY.md`

## Disclaimer

This project is an MVP reference implementation for emergency tooling.  
Do not use as a sole life-safety system without certified data feeds, official agency integration, and operational validation.