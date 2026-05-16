from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from app.preprocessing import engineer_features, features_from_payload


MODEL_FILE = Path(__file__).with_name("model.joblib")


def load_or_create_model():
    if MODEL_FILE.exists():
        return joblib.load(MODEL_FILE)

    # Fallback bootstrap model when model.joblib is missing.
    # Run `python train.py` to train from Washington_Large_Fires_1973-2022.csv.
    rng = np.random.default_rng(42)
    sample = pd.DataFrame(
        {
            "temperature_c": rng.uniform(15, 45, 500),
            "humidity_pct": rng.uniform(5, 70, 500),
            "wind_speed_kph": rng.uniform(0, 60, 500),
            "vegetation_dryness_index": rng.uniform(0.2, 1.0, 500),
        }
    )
    engineered = engineer_features(sample)
    target = (
        engineered["temperature_c"] * 0.02
        + (1 - engineered["humidity_pct"] / 100.0) * 0.4
        + engineered["wind_speed_kph"] * 0.008
        + engineered["vegetation_dryness_index"] * 0.35
    ).clip(0, 1)

    model = RandomForestRegressor(n_estimators=150, random_state=42)
    model.fit(engineered, target)
    joblib.dump(model, MODEL_FILE)
    return model


def predict_risk(model, payload: dict) -> dict:
    engineered = features_from_payload(payload)
    feature_names = getattr(model, "feature_names_in_", engineered.columns)
    X = engineered[list(feature_names)]
    risk = float(np.clip(model.predict(X)[0], 0, 1))

    feature_importance = getattr(model, "feature_importances_", None)
    explainability = {}
    if feature_importance is not None:
        importance_names = getattr(model, "feature_names_in_", engineered.columns)
        explainability["top_factors"] = sorted(
            zip(importance_names, feature_importance),
            key=lambda x: x[1],
            reverse=True,
        )[:3]
        explainability["top_factors"] = [
            f"{name}: {round(weight, 3)}" for name, weight in explainability["top_factors"]
        ]

    # Direction/ETA are lightweight heuristics layered on top of risk score.
    spread_direction = "NE" if payload["wind_speed_kph"] > 20 else "N"
    eta = max(10, int(240 * (1 - risk)))
    confidence = min(0.98, 0.6 + abs(risk - 0.5))

    return {
        "risk_score": round(risk, 4),
        "confidence": round(float(confidence), 4),
        "spread_direction": spread_direction,
        "estimated_arrival_minutes": eta,
        "explainability": explainability,
    }
