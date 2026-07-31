"""GET /overview/summary – Aggregated operational metrics."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ward, InventoryItem, Prediction
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
async def get_overview_summary(db: Session = Depends(get_db)):
    """Return aggregated operational metrics and real-time risk scores."""
    
    # Beds
    wards = db.query(Ward).all()
    total_beds = sum(w.capacity for w in wards)
    occupied_beds = sum(w.occupied_beds for w in wards)
    available_beds = total_beds - occupied_beds
    occupancy_rate = round((occupied_beds / total_beds * 100) if total_beds else 0.0, 2)
    beds = BedSummary(
        total_beds=total_beds,
        occupied_beds=occupied_beds,
        available_beds=available_beds,
        occupancy_rate=occupancy_rate,
    )

    # Staff (Placeholder since we don't track on-duty shifts yet)
    staff = StaffSummary(
        total_staff=120,
        on_duty=45,
        off_duty=60,
        on_break=10,
        on_leave=5
    )

    # Inventory
    inventory_items = db.query(InventoryItem).all()
    total_items = len(inventory_items)
    items_below_threshold = sum(1 for i in inventory_items if i.stock_level < i.critical_threshold)
    critical_items = sum(1 for i in inventory_items if i.stock_level == 0)
    inventory = InventoryAlert(
        total_items=total_items,
        items_below_threshold=items_below_threshold,
        critical_items=critical_items
    )

    # Risk breakdown
    active_preds = db.query(Prediction).filter(Prediction.status == "active").all()
    critical = sum(1 for p in active_preds if p.risk_score >= 0.9)
    high = sum(1 for p in active_preds if 0.7 <= p.risk_score < 0.9)
    medium = sum(1 for p in active_preds if 0.4 <= p.risk_score < 0.7)
    low = sum(1 for p in active_preds if p.risk_score < 0.4)
    total_active = len(active_preds)
    
    risk = RiskBreakdown(
        critical=critical, high=high, medium=medium,
        low=low, total_active=total_active,
    )

    summary = OverviewSummary(
        beds=beds, staff=staff, inventory=inventory, risk=risk,
        generated_at=datetime.now(timezone.utc),
    )
    return EnvelopeResponse(data=summary)
