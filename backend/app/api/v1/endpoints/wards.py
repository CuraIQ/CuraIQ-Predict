"""Ward capacity endpoints."""

import random
from uuid import UUID
from fastapi import APIRouter

from app.in_memory_db import db
from app.schemas.ward import WardCapacityOut
from app.schemas.common import EnvelopeResponse

router = APIRouter(prefix="/wards", tags=["Wards"])

def _forecast_24h(occupied: int, total: int) -> int:
    """Simple trend-based 24h forecast (placeholder for ML model)."""
    drift = random.uniform(-0.05, 0.15)
    forecasted = int(occupied * (1 + drift))
    return max(0, min(forecasted, total))

def _risk_flag(occupancy_pct: float) -> str:
    if occupancy_pct >= 90:
        return "red"
    if occupancy_pct >= 75:
        return "amber"
    return "green"

@router.get("/capacity", response_model=EnvelopeResponse[list[WardCapacityOut]])
async def get_ward_capacity():
    """Ward-level live and 24h forecasted occupancy numbers."""
    wards = db["wards"]
    items = []
    
    for w in wards:
        total = w.get("total_beds", 0)
        occupied = w.get("occupied_beds", 0)
        available = total - occupied
        occ_rate = round((occupied / total * 100) if total else 0.0, 2)
        forecasted = _forecast_24h(occupied, total)
        forecasted_rate = round((forecasted / total * 100) if total else 0.0, 2)

        items.append(
            WardCapacityOut(
                id=UUID(w["id"]),
                ward_name=w.get("name", "Unknown"),
                ward_type="general", # hardcoded as placeholder
                hospital_id=None,
                capacity=total,
                total_beds=total,
                occupied_beds=occupied,
                available_beds=available,
                occupancy_rate=occ_rate,
                forecasted_occupied_24h=forecasted,
                forecasted_occupancy_rate_24h=forecasted_rate,
                risk_flag=_risk_flag(forecasted_rate),
            )
        )
    return EnvelopeResponse(data=items)
