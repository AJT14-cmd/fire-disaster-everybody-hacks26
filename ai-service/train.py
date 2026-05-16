from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from app.dataset_loader import DEFAULT_DATA_PATH, load_washington_fires_training_frame
from app.preprocessing import engineer_features

MODEL_PATH = Path(__file__).parent / "app" / "model.joblib"


def main():
    df = load_washington_fires_training_frame(DEFAULT_DATA_PATH)
    print(f"Loaded {len(df)} training rows from {DEFAULT_DATA_PATH.name}")

    feature_cols = [
        "temperature_c",
        "humidity_pct",
        "wind_speed_kph",
        "vegetation_dryness_index",
    ]
    X = engineer_features(df[feature_cols])
    y = df["risk_score"]

    x_train, x_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=250, random_state=42, n_jobs=-1)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    joblib.dump(model, MODEL_PATH)
    print(f"Training complete. MAE={mae:.4f}, R2={r2:.4f}")
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
