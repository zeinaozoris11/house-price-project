from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Matches the feature set the model pipeline was trained on."""

    location: str = Field(..., description="Property location (city/area)")
    carpet_area_sqft: float = Field(..., gt=0, description="Carpet area in square feet")
    floor_num: int = Field(..., ge=0, description="Floor number (0 = ground)")
    bathroom_num: int = Field(..., ge=0, description="Number of bathrooms")
    balcony_num: int = Field(..., ge=0, description="Number of balconies")
    furnishing: str = Field(..., description='"Furnished" | "Semi-Furnished" | "Unfurnished"')
    transaction: str = Field(..., description='"New Property" | "Resale"')
    ownership: str = Field(..., description="Ownership type, e.g. Freehold / Leasehold")
    facing: str = Field(..., description="Facing direction, e.g. East / West / North")

    model_config = {
        "json_schema_extra": {
            "example": {
                "location": "thane",
                "carpet_area_sqft": 750,
                "floor_num": 3,
                "bathroom_num": 2,
                "balcony_num": 1,
                "furnishing": "Semi-Furnished",
                "transaction": "Resale",
                "ownership": "Freehold",
                "facing": "East",
            }
        }
    }


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str
