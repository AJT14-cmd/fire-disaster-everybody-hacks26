from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

from app.preprocessing import engineer_features

DATA_PATH = Path(__file__).parent / "data" / "sample_training_data.csv"
MODEL_PATH = Path(__file__).parent / "app" / "model.joblib"


def main():
    df = pd.read_csv(DATA_PATH)
    y = df["risk_score"]
    X = engineer_features(df.drop(columns=["risk_score"]))

    x_train, x_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(n_estimators=250, random_state=42)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)
    mae = mean_absolute_error(y_test, preds)

    joblib.dump(model, MODEL_PATH)
    print(f"Training complete. MAE={mae:.4f}. Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
