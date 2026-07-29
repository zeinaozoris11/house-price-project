import json
from functools import lru_cache
from pathlib import Path

import pandas as pd

from app.core.config import get_settings
from app.schemas.prediction import PredictionRequest

# Must match numeric_features + categorical_features from the training notebook.
NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom_num", "balcony_num"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]


@lru_cache
def get_known_locations() -> set[str]:
    """Load the list of locations seen during training (for unknown-location mapping)."""
    path = Path(get_settings().locations_path)
    if not path.exists():
        return set()
    with path.open(encoding="utf-8") as f:
        return set(json.load(f))


def request_to_dataframe(payload: PredictionRequest) -> pd.DataFrame:
    """Build a single-row DataFrame with exactly the column names used in training.

    Unknown locations are mapped to "other", matching the notebook's grouping step.
    The pipeline itself (loaded from house_price.pkl) handles imputation, scaling,
    and one-hot encoding — no manual encoding is done here.
    """
    known_locations = get_known_locations()
    location = payload.location.strip().lower()
    location_grouped = location if (not known_locations or location in known_locations) else "other"

    row = {
        "carpet_area_sqft": payload.carpet_area_sqft,
        "floor_num": payload.floor_num,
        "bathroom_num": payload.bathroom_num,
        "balcony_num": payload.balcony_num,
        "location_grouped": location_grouped,
        "Furnishing": payload.furnishing,
        "Transaction": payload.transaction,
        "Ownership": payload.ownership,
        "facing": payload.facing,
    }

    return pd.DataFrame([row], columns=NUMERIC_FEATURES + CATEGORICAL_FEATURES)
