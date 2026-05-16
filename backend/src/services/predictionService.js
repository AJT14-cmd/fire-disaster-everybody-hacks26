import axios from "axios";
import { env } from "../config/env.js";

export async function getWildfirePrediction(input) {
  try {
    const { data } = await axios.post(`${env.aiServiceBaseUrl}/predict`, input, {
      timeout: 10000
    });
    return data;
  } catch {
    const fallbackScore = Math.min(
      1,
      (input.temperature_c ?? 20) / 45 +
        (1 - (input.humidity_pct ?? 30) / 100) * 0.4 +
        (input.wind_speed_kph ?? 5) / 80
    );
    return {
      risk_score: Number(fallbackScore.toFixed(3)),
      confidence: 0.45,
      spread_direction: "NE",
      estimated_arrival_minutes: Math.max(15, Math.round(180 * (1 - fallbackScore))),
      explainability: {
        top_factors: [
          "Fallback model in use",
          "Temperature and low humidity elevated risk"
        ]
      }
    };
  }
}
