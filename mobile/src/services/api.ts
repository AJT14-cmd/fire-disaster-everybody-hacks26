import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export const api = axios.create({ baseURL, timeout: 10000 });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
