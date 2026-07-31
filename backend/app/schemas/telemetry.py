from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TelemetryRecord(BaseModel):
    """A single telemetry observation."""

    hospital_id: UUID
    ward_id: UUID | None = None
    metric_name: str = Field(..., min_length=1, max_length=255)
    metric_value: float
    unit: str | None = Field(None, max_length=50)
    recorded_at: datetime | None = Field(None, description="Defaults to server time if omitted")


class TelemetryIngestRequest(BaseModel):
    """Batch ingest request."""

    records: list[TelemetryRecord] = Field(..., min_length=1, max_length=1000, description="Batch of telemetry records")


class TelemetryIngestResponse(BaseModel):
    """Response after successful ingestion."""

    ingested: int = Field(..., description="Number of records ingested")
    message: str = "Telemetry records ingested successfully"
