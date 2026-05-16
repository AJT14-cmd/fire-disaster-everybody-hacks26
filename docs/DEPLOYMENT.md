# Deployment Guide

## Backend (Vercel or Render)

1. Set project root to `backend`.
2. Add all variables from `backend/.env.example`.
3. Ensure `DATABASE_URL` points to your self-hosted PostgreSQL instance.
4. Ensure PostgreSQL allows inbound connections from your host.
4. Run start command: `npm run start`.

## Mobile (Expo)

1. Build with EAS:
   - `npx eas build -p ios`
   - `npx eas build -p android`
2. Inject `EXPO_PUBLIC_API_BASE_URL` and map API keys.

## AI Service (Railway/Render)

1. Set root to `ai-service`.
2. Install command: `pip install -r requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Add `MODEL_PATH` and optional model retraining schedule.

## Runtime Notes

- Use HTTPS only for all public endpoints.
- Configure health checks:
  - backend: `/api/health`
  - ai-service: `/health`
- Add monitoring and alerts for API latency and failed notifications.
