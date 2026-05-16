from pathlib import Path

import numpy as np
import pandas as pd

DEFAULT_DATA_PATH = (
    Path(__file__).parent.parent / "data" / "Washington_Large_Fires_1973-2022.csv"
)


def load_washington_fires_training_frame(
    csv_path: Path | str | None = None,
) -> pd.DataFrame:
    """
    Build a training frame from Washington historical fire perimeters.

    Weather columns are season/cause proxies derived from fire metadata because
    the source CSV does not include live weather observations.
    """
    path = Path(csv_path) if csv_path else DEFAULT_DATA_PATH
    raw = pd.read_csv(path)

    df = raw.copy()
    df["start"] = pd.to_datetime(df["STARTDATE"], utc=True, errors="coerce")
    df["acres"] = pd.to_numeric(df["ACRES"], errors="coerce")
    df = df.dropna(subset=["start", "acres"])
    df = df[df["acres"] > 0].reset_index(drop=True)

    month = df["start"].dt.month.astype(int)
    # Pacific NW fire season peaks mid/late summer.
    seasonal_heat = np.sin((month - 4) * np.pi / 5.0)
    seasonal_heat = np.clip(seasonal_heat, 0, 1)

    cause = df.get("CAUSE", pd.Series(["UNKNOWN"] * len(df))).astype(str).str.upper()
    lightning = cause.str.contains("LIGHTNING", na=False).astype(float)
    human = cause.str.contains("HUMAN|DEBRIS|CAMP|INCENDIARY", na=False).astype(float)

    acre_rank = df["acres"].rank(pct=True).to_numpy()

    temperature_c = 14.0 + seasonal_heat * 24.0 + lightning * 2.0
    humidity_pct = np.clip(72.0 - seasonal_heat * 38.0 - acre_rank * 12.0, 8.0, 90.0)
    wind_speed_kph = np.clip(6.0 + seasonal_heat * 22.0 + acre_rank * 18.0 + lightning * 4.0, 0.0, 80.0)
    vegetation_dryness_index = np.clip(
        0.25 + seasonal_heat * 0.55 + acre_rank * 0.15 + human * 0.05,
        0.0,
        1.0,
    )

    # Label: larger historical fires imply higher realized risk under those conditions.
    log_acres = np.log1p(df["acres"].to_numpy())
    risk_score = (log_acres - log_acres.min()) / (log_acres.max() - log_acres.min() + 1e-9)
    risk_score = np.clip(risk_score * 0.85 + seasonal_heat * 0.15, 0.0, 1.0)

    return pd.DataFrame(
        {
            "temperature_c": temperature_c,
            "humidity_pct": humidity_pct,
            "wind_speed_kph": wind_speed_kph,
            "vegetation_dryness_index": vegetation_dryness_index,
            "risk_score": risk_score,
            "fire_year": df["YEAR"].astype(int),
            "fire_acres": df["acres"],
            "fire_cause": cause,
        }
    )
