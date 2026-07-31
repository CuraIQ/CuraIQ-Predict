from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class WardCapacityOut(BaseModel):
    """Live ward capacity with 24h forecast."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ward_name: str
    ward_type: str
    hospital_id: UUID
    capacity: int
    total_beds: int
    occupied_beds: int
    available_beds: int = Field(..., description="total_beds - occupied_beds")
    occupancy_rate: float = Field(..., description="Percentage 0-100")
    forecasted_occupied_24h: int = Field(..., description="Predicted occupied beds in 24h")
    forecasted_occupancy_rate_24h: float = Field(..., description="Predicted occupancy rate in 24h")
    risk_flag: str = Field(..., description="green / amber / red based on forecast")
