"""Telemetry ingestion endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.operational_log import OperationalLog
from app.schemas.telemetry import TelemetryIngestRequest, TelemetryIngestResponse
from app.schemas.common import EnvelopeResponse

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.post("/ingest", response_model=EnvelopeResponse[TelemetryIngestResponse], status_code=201)
async def ingest_telemetry(
    body: TelemetryIngestRequest,
    db: AsyncSession = Depends(get_db),
):
    """Batch ingest simulated hospital telemetry records."""
    logs = []
    for record in body.records:
        log = OperationalLog(
            hospital_id=record.hospital_id,
            ward_id=record.ward_id,
            metric_name=record.metric_name,
            metric_value=record.metric_value,
            unit=record.unit,
        )
        if record.recorded_at:
            log.recorded_at = record.recorded_at
        logs.append(log)

    db.add_all(logs)
    await db.commit()

    return EnvelopeResponse(
        data=TelemetryIngestResponse(ingested=len(logs))
    )
