"""Prediction endpoints – list active alerts and act on them."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, PaginationParams
from app.exceptions import NotFoundException, ConflictException
from app.models import Prediction
from app.models.prediction import PredictionStatus
from app.schemas.common import PaginatedResponse, PaginationMeta, EnvelopeResponse
from app.schemas.prediction import (
    PredictionOut,
    PredictionActionRequest,
    PredictionActionResponse,
    PredictionAction,
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])


def _prediction_to_out(p: Prediction) -> PredictionOut:
    """Map ORM row to response schema with enum values as strings."""
    return PredictionOut(
        id=p.id,
        prediction_type=p.prediction_type.value,
        ward_id=p.ward_id,
        item_id=p.item_id,
        risk_score=p.risk_score,
        risk_level=_risk_level(p.risk_score),
        forecasted_event=p.forecasted_event,
        target_timestamp=p.target_timestamp,
        recommended_action=p.recommended_action,
        status=p.status.value,
        created_at=p.created_at,
    )


def _risk_level(score: float) -> str:
    """Derive human-readable risk level from numeric score."""
    if score >= 0.9:
        return "critical"
    if score >= 0.7:
        return "high"
    if score >= 0.4:
        return "medium"
    return "low"


_RISK_RANGES: dict[str, tuple[float, float]] = {
    "critical": (0.9, 1.01),
    "high": (0.7, 0.9),
    "medium": (0.4, 0.7),
    "low": (0.0, 0.4),
}


@router.get("/active", response_model=PaginatedResponse[PredictionOut])
async def list_active_predictions(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(),
    risk_level: str | None = Query(None, description="Filter: critical, high, medium, low"),
    prediction_type: str | None = Query(None, description="Filter by prediction_type enum value"),
    ward_id: UUID | None = Query(None, description="Filter by ward UUID"),
):
    """Paginated list of active AI alerts, filterable by risk level."""
    base = select(Prediction).where(Prediction.status == PredictionStatus.ACTIVE)

    if risk_level and risk_level in _RISK_RANGES:
        lo, hi = _RISK_RANGES[risk_level]
        base = base.where(Prediction.risk_score >= lo, Prediction.risk_score < hi)
    if prediction_type:
        base = base.where(Prediction.prediction_type == prediction_type)
    if ward_id:
        base = base.where(Prediction.ward_id == ward_id)

    # Total count
    count_q = select(func.count()).select_from(base.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Fetch page
    rows_q = base.order_by(Prediction.risk_score.desc(), Prediction.created_at.desc()).offset(
        pagination.offset
    ).limit(pagination.page_size)
    result = await db.execute(rows_q)
    predictions = result.scalars().all()

    items = [_prediction_to_out(p) for p in predictions]

    total_pages = max(1, -(-total // pagination.page_size))  # ceil division
    return PaginatedResponse(
        data=items,
        meta=PaginationMeta(
            page=pagination.page,
            page_size=pagination.page_size,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.post("/{prediction_id}/action", response_model=EnvelopeResponse[PredictionActionResponse])
async def act_on_prediction(
    prediction_id: UUID,
    body: PredictionActionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Accept, dismiss, or override an AI recommendation."""
    result = await db.execute(select(Prediction).where(Prediction.id == prediction_id))
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise NotFoundException(detail=f"Prediction {prediction_id} not found")

    if prediction.status != PredictionStatus.ACTIVE:
        raise ConflictException(
            detail=f"Prediction is already '{prediction.status.value}' and cannot be actioned",
            error_code="PREDICTION_NOT_ACTIONABLE",
        )

    status_map = {
        PredictionAction.ACCEPT: PredictionStatus.ACCEPTED,
        PredictionAction.DISMISS: PredictionStatus.DISMISSED,
        PredictionAction.OVERRIDE: PredictionStatus.OVERRIDDEN,
    }
    prediction.status = status_map[body.action]
    prediction.action_notes = body.notes
    prediction.actioned_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(prediction)

    return EnvelopeResponse(
        data=PredictionActionResponse(
            id=prediction.id,
            status=prediction.status.value,
            action_notes=prediction.action_notes,
            actioned_at=prediction.actioned_at,
        )
    )
