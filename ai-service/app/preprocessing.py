import pandas as pd


FEATURE_COLUMNS = [
    "temperature_c",
    "humidity_pct",
    "wind_speed_kph",
    "vegetation_dryness_index",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    enriched = df.copy()
    enriched["dryness_humidity_ratio"] = enriched["vegetation_dryness_index"] / (
        enriched["humidity_pct"] + 1.0
    )
    enriched["wind_temp_interaction"] = (
        enriched["wind_speed_kph"] * enriched["temperature_c"] / 100.0
    )
    return enriched
