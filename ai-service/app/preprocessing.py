import pandas as pd


FEATURE_COLUMNS = [
    "temperature_c",
    "humidity_pct",
    "wind_speed_kph",
    "vegetation_dryness_index",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Model is trained on weather/fuel columns only (not lat/lng).
    base = df[FEATURE_COLUMNS].copy()
    enriched = base.copy()
    enriched["dryness_humidity_ratio"] = enriched["vegetation_dryness_index"] / (
        enriched["humidity_pct"] + 1.0
    )
    enriched["wind_temp_interaction"] = (
        enriched["wind_speed_kph"] * enriched["temperature_c"] / 100.0
    )
    return enriched


def features_from_payload(payload: dict) -> pd.DataFrame:
    """Extract model input row from API request (ignores latitude/longitude)."""
    row = {col: payload[col] for col in FEATURE_COLUMNS}
    return engineer_features(pd.DataFrame([row]))
