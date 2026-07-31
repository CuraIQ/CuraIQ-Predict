from pydantic import BaseModel, Field


class BedSummary(BaseModel):
    """Aggregated bed statistics."""

    total_beds: int = Field(..., description="Total beds across all wards")
    occupied_beds: int = Field(..., description="Currently occupied beds")
    available_beds: int = Field(..., description="Available beds")
    occupancy_rate: float = Field(..., description="Occupancy rate as percentage 0-100")


class StaffSummary(BaseModel):
    """Aggregated staff statistics."""

    total_staff: int
    on_duty: int
    off_duty: int
    on_break: int
    on_leave: int


class InventoryAlert(BaseModel):
    """Inventory items below threshold."""

    total_items: int
    items_below_threshold: int
    critical_items: int = Field(..., description="Items with zero stock")


class RiskBreakdown(BaseModel):
    """Active predictions broken down by risk level."""

    critical: int = Field(0, description="risk_score >= 0.9")
    high: int = Field(0, description="0.7 <= risk_score < 0.9")
    medium: int = Field(0, description="0.4 <= risk_score < 0.7")
    low: int = Field(0, description="risk_score < 0.4")
    total_active: int = 0


class OverviewSummary(BaseModel):
    """Top-level operational overview."""

    beds: BedSummary
    staff: StaffSummary
    inventory: InventoryAlert
    risk: RiskBreakdown
    generated_at: str = Field(..., description="ISO-8601 timestamp of generation")
