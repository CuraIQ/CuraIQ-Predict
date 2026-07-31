"""GET /overview/summary – Aggregated operational metrics."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models import Ward, Staff, InventoryItem, Prediction
from app.models.staff import ShiftStatus
from app.models.prediction import PredictionStatus
from app.schemas.overview import (
    BedSummary,
    StaffSummary,
    InventoryAlert,
    RiskBreakdown,
    OverviewSummary,
)
from app.schemas.common import EnvelopeResponse

router = APIRouter(prefix="/overview", tags=["Overview"])


@router.get("/summary", response_model=EnvelopeResponse[OverviewSummary])
async def get_overview_summary(db: AsyncSession = Depends(get_db)):
    """Return aggregated operational metrics and real-time risk scores."""

    # ── Beds ────────────────────────────────────────────────────────────
    bed_result = await db.execute(
        select(
            func.coalesce(func.sum(Ward.total_beds), 0).label("total_beds"),
            func.coalesce(func.sum(Ward.occupied_beds), 0).label("occupied_beds"),
        )
    )
    bed_row = bed_result.one()
    total_beds = int(bed_row.total_beds)
    occupied_beds = int(bed_row.occupied_beds)
    available_beds = total_beds - occupied_beds
    occupancy_rate = round((occupied_beds / total_beds * 100) if total_beds else 0.0, 2)
    beds = BedSummary(
        total_beds=total_beds,
        occupied_beds=occupied_beds,
        available_beds=available_beds,
        occupancy_rate=occupancy_rate,
    )

    # ── Staff ───────────────────────────────────────────────────────────
    staff_result = await db.execute(
        select(
            func.count().label("total"),
            func.count().filter(Staff.shift_status == ShiftStatus.ON_DUTY).label("on_duty"),
            func.count().filter(Staff.shift_status == ShiftStatus.OFF_DUTY).label("off_duty"),
            func.count().filter(Staff.shift_status == ShiftStatus.ON_BREAK).label("on_break"),
            func.count().filter(Staff.shift_status == ShiftStatus.ON_LEAVE).label("on_leave"),
        )
    )
    sr = staff_result.one()
    staff = StaffSummary(
        total_staff=sr.total, on_duty=sr.on_duty, off_duty=sr.off_duty,
        on_break=sr.on_break, on_leave=sr.on_leave,
    )

    # ── Inventory ───────────────────────────────────────────────────────
    inv_result = await db.execute(
        select(
            func.count().label("total_items"),
            func.count().filter(InventoryItem.current_stock < InventoryItem.minimum_threshold).label("below"),
            func.count().filter(InventoryItem.current_stock == 0).label("critical"),
        )
    )
    ir = inv_result.one()
    inventory = InventoryAlert(
        total_items=ir.total_items,
        items_below_threshold=ir.below,
        critical_items=ir.critical,
    )

    # ── Risk breakdown (active predictions) ─────────────────────────────
    risk_result = await db.execute(
        select(
            func.count().filter(Prediction.risk_score >= 0.9).label("critical"),
            func.count().filter(Prediction.risk_score >= 0.7, Prediction.risk_score < 0.9).label("high"),
            func.count().filter(Prediction.risk_score >= 0.4, Prediction.risk_score < 0.7).label("medium"),
            func.count().filter(Prediction.risk_score < 0.4).label("low"),
            func.count().label("total_active"),
        ).where(Prediction.status == PredictionStatus.ACTIVE)
    )
    rr = risk_result.one()
    risk = RiskBreakdown(
        critical=rr.critical, high=rr.high, medium=rr.medium,
        low=rr.low, total_active=rr.total_active,
    )

    summary = OverviewSummary(
        beds=beds, staff=staff, inventory=inventory, risk=risk,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
    return EnvelopeResponse(data=summary)
