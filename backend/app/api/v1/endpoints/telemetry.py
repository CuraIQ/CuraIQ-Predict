"""Telemetry ingestion endpoint."""

from fastapi import APIRouter

from app.in_memory_db import db
from app.schemas.telemetry import TelemetryIngestRequest, TelemetryIngestResponse
from app.schemas.common import EnvelopeResponse

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("/ingest", response_model=EnvelopeResponse[TelemetryIngestResponse], status_code=201)
async def ingest_telemetry(
    body: TelemetryIngestRequest,
):
    """Batch ingest simulated hospital telemetry records."""
    logs = []
    for record in body.records:
        log = {
            "hospital_id": str(record.hospital_id),
            "ward_id": str(record.ward_id) if record.ward_id else None,
            "metric_name": record.metric_name,
            "metric_value": record.metric_value,
            "unit": record.unit,
            "recorded_at": record.recorded_at.isoformat() if record.recorded_at else None
        }
        logs.append(log)

    db["telemetry"].extend(logs)

    return EnvelopeResponse(
        data=TelemetryIngestResponse(ingested=len(logs))
    )
