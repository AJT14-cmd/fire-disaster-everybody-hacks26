import dotenv from "dotenv";

dotenv.config();

function getEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/firepath"),
  jwtSecret: getEnv("JWT_SECRET", "replace-with-long-random-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "12h",
  osrmBaseUrl: process.env.OSRM_BASE_URL ?? "https://router.project-osrm.org",
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY ?? "",
  // NWS api.weather.gov requires User-Agent with app name + contact (no API key).
  noaaUserAgent:
    process.env.NOAA_USER_AGENT ??
    "FirePathAI/1.0 (set NOAA_USER_AGENT in .env with your email)",
  nasaFirmsApiKey: process.env.NASA_FIRMS_API_KEY ?? "",
  aiServiceBaseUrl: process.env.AI_SERVICE_BASE_URL ?? "http://localhost:8000",
  locationEncryptionKey: getEnv(
    "LOCATION_ENCRYPTION_KEY",
    "0123456789abcdef0123456789abcdef"
  )
};
