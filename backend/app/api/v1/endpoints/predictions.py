from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Prediction
from app.dependencies import PaginationParams
from app.exceptions import NotFoundException, ConflictException
from app.schemas.common import PaginatedResponse, PaginationMeta, EnvelopeResponse
from app.schemas.prediction import (
    PredictionOut,
    PredictionActionRequest,
    PredictionActionResponse,
    PredictionAction,
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])

def _risk_level(score: float) -> str:
    if score >= 0.9: return "critical"
    if score >= 0.7: return "high"
    if score >= 0.4: return "medium"
    return "low"

_RISK_RANGES: dict[str, tuple[float, float]] = {
    "critical": (0.9, 1.01),
    "high": (0.7, 0.9),
    "medium": (0.4, 0.7),
    "low": (0.0, 0.4),
}

@router.get("/active", response_model=PaginatedResponse[PredictionOut])
async def list_active_predictions(
    pagination: PaginationParams = Depends(),
    risk_level: str | None = Query(None, description="Filter: critical, high, medium, low"),
    prediction_type: str | None = Query(None, description="Filter by prediction_type enum value"),
    ward_id: UUID | None = Query(None, description="Filter by ward UUID"),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction).filter(Prediction.status == "active")

    if risk_level and risk_level in _RISK_RANGES:
        lo, hi = _RISK_RANGES[risk_level]
        query = query.filter(Prediction.risk_score >= lo, Prediction.risk_score < hi)
    if prediction_type:
        query = query.filter(Prediction.prediction_type == prediction_type)
    if ward_id:
        query = query.filter(Prediction.target_ward_id == str(ward_id))

    query = query.order_by(Prediction.risk_score.desc(), Prediction.created_at.desc())
    
    total = query.count()
    start = pagination.offset
    end = start + pagination.page_size
    page_items = query.offset(start).limit(pagination.page_size).all()

    items = [
        PredictionOut(
            id=UUID(p.id),
            prediction_type=p.prediction_type,
            ward_id=UUID(p.target_ward_id) if p.target_ward_id else None,
            item_id=UUID(p.target_item_id) if p.target_item_id else None,
            risk_score=p.risk_score,
            risk_level=_risk_level(p.risk_score),
            forecasted_event=p.forecasted_event,
            target_timestamp=p.target_timestamp,
            recommended_action=p.recommended_action,
            status=p.status,
            created_at=p.created_at,
        )
        for p in page_items
    ]

    total_pages = max(1, -(-total // pagination.page_size))
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
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.id == str(prediction_id)).first()
    if not pred:
        raise NotFoundException(detail=f"Prediction {prediction_id} not found")

    if pred.status != "active":
        raise ConflictException(
            detail=f"Prediction is already '{pred.status}' and cannot be actioned",
            error_code="PREDICTION_NOT_ACTIONABLE",
        )

    status_map = {
        PredictionAction.ACCEPT: "accepted",
        PredictionAction.DISMISS: "dismissed",
        PredictionAction.OVERRIDE: "overridden",
    }
    pred.status = status_map[body.action]
    actioned_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(pred)

    return EnvelopeResponse(
        data=PredictionActionResponse(
            id=UUID(pred.id),
            status=pred.status,
            action_notes=body.notes,
            actioned_at=actioned_at,
        )
    )
