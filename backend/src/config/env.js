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
  firebaseProjectId: getEnv("FIREBASE_PROJECT_ID", "demo-project"),
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY ?? "",
  noaaToken: process.env.NOAA_TOKEN ?? "",
  nasaFirmsApiKey: process.env.NASA_FIRMS_API_KEY ?? "",
  twilioSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioFrom: process.env.TWILIO_FROM_NUMBER ?? "",
  aiServiceBaseUrl: process.env.AI_SERVICE_BASE_URL ?? "http://localhost:8000",
  locationEncryptionKey: getEnv(
    "LOCATION_ENCRYPTION_KEY",
    "0123456789abcdef0123456789abcdef"
  )
};
