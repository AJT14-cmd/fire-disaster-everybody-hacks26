export type GeoPoint = {
  lat: number;
  lng: number;
};

export type FireRiskResponse = {
  risk_score: number;
  confidence: number;
  spread_direction: string;
  estimated_arrival_minutes: number;
};
