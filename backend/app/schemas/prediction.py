from datetime import datetime
import enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PredictionAction(str, enum.Enum):
    """Allowed actions on a prediction."""

    ACCEPT = "accept"
    DISMISS = "dismiss"
    OVERRIDE = "override"


class PredictionOut(BaseModel):
    """Schema for a single prediction in list responses."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    prediction_type: str
    ward_id: UUID | None = None
    item_id: UUID | None = None
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: str = Field(..., description="Derived: critical/high/medium/low")
    forecasted_event: str
    target_timestamp: datetime
    recommended_action: str | None = None
    status: str
    created_at: datetime


class PredictionActionRequest(BaseModel):
    """Request body for acting on a prediction."""

    action: PredictionAction
    notes: str | None = Field(None, max_length=2000, description="Optional notes for the action")


class PredictionActionResponse(BaseModel):
    """Response after acting on a prediction."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str
    action_notes: str | None = None
    actioned_at: datetime | None = None
