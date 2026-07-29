import logging
from pathlib import Path

import joblib
import pandas as pd

logger = logging.getLogger(__name__)


class ModelService:
    """Wraps the trained sklearn Pipeline (preprocessing + regressor)."""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None

    def load(self) -> None:
        path = Path(self.model_path)
        if not path.exists():
            raise FileNotFoundError(
                f"Model file not found at '{path}'. Copy house_price.pkl "
                "from your notebook into backend/models/."
            )
        self.model = joblib.load(path)
        logger.info("Model loaded from %s", path)

    def predict(self, X: pd.DataFrame) -> float:
        if self.model is None:
            raise RuntimeError("Model is not loaded yet.")
        prediction = self.model.predict(X)
        return float(prediction[0])


# Single shared instance, populated at FastAPI startup (see app/main.py lifespan).
model_service = ModelService(model_path="models/house_price.pkl")
