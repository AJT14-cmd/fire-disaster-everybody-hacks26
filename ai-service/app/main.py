from fastapi import FastAPI

from app.model import load_or_create_model, predict_risk
from app.schemas import PredictRequest, PredictResponse

app = FastAPI(title="FirePath AI Prediction Service", version="1.0.0")
model = load_or_create_model()


@app.get("/health")
def health():
    return {"ok": True, "service": "ai-service"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    payload = request.model_dump()
    response = predict_risk(model, payload)
    return response
