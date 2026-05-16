from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    latitude: float
    longitude: float
    temperature_c: float = Field(ge=-50, le=80)
    humidity_pct: float = Field(ge=0, le=100)
    wind_speed_kph: float = Field(ge=0, le=300)
    vegetation_dryness_index: float = Field(ge=0, le=1)


class PredictResponse(BaseModel):
    risk_score: float
    confidence: float
    spread_direction: str
    estimated_arrival_minutes: int
    explainability: dict
