"""GET /overview/summary – Aggregated operational metrics."""

from datetime import datetime, timezone
from fastapi import APIRouter

from app.in_memory_db import db
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
async def get_overview_summary():
    """Return aggregated operational metrics and real-time risk scores."""
    
    # Beds
    total_beds = sum(w["total_beds"] for w in db["wards"])
    occupied_beds = sum(w["occupied_beds"] for w in db["wards"])
    available_beds = total_beds - occupied_beds
    occupancy_rate = round((occupied_beds / total_beds * 100) if total_beds else 0.0, 2)
    beds = BedSummary(
        total_beds=total_beds,
        occupied_beds=occupied_beds,
        available_beds=available_beds,
        occupancy_rate=occupancy_rate,
    )

    # Staff
    staff = StaffSummary(**db["staff"])

    # Inventory
    inventory = InventoryAlert(**db["inventory"])

    # Risk breakdown
    critical = sum(1 for p in db["predictions"] if p["status"] == "active" and p["risk_score"] >= 0.9)
    high = sum(1 for p in db["predictions"] if p["status"] == "active" and 0.7 <= p["risk_score"] < 0.9)
    medium = sum(1 for p in db["predictions"] if p["status"] == "active" and 0.4 <= p["risk_score"] < 0.7)
    low = sum(1 for p in db["predictions"] if p["status"] == "active" and p["risk_score"] < 0.4)
    total_active = sum(1 for p in db["predictions"] if p["status"] == "active")
    
    risk = RiskBreakdown(
        critical=critical, high=high, medium=medium,
        low=low, total_active=total_active,
    )

    summary = OverviewSummary(
        beds=beds, staff=staff, inventory=inventory, risk=risk,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
    return EnvelopeResponse(data=summary)
