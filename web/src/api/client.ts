import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const api = axios.create({ baseURL, timeout: 15000 });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export type AppUser = {
  id: string;
  email: string;
  roles: string[];
  displayName?: string | null;
};

export type RiskPrediction = {
  risk_score: number;
  confidence: number;
  spread_direction: string;
  estimated_arrival_minutes: number;
  explainability?: { top_factors?: string[] };
};
