"""Ward capacity endpoints."""

import random

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models import Ward
from app.schemas.ward import WardCapacityOut
from app.schemas.common import EnvelopeResponse

router = APIRouter(prefix="/wards", tags=["Wards"])


def _forecast_24h(occupied: int, total: int) -> int:
    """Simple trend-based 24h forecast (placeholder for ML model).

    Applies a random drift of -5% to +15% to simulate realistic
    occupancy movement, clamped to [0, total].
    """
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
async def get_ward_capacity(db: AsyncSession = Depends(get_db)):
    """Ward-level live and 24h forecasted occupancy numbers."""
    result = await db.execute(select(Ward))
    wards = result.scalars().all()

    items = []
    for w in wards:
        available = w.total_beds - w.occupied_beds
        occ_rate = round((w.occupied_beds / w.total_beds * 100) if w.total_beds else 0.0, 2)
        forecasted = _forecast_24h(w.occupied_beds, w.total_beds)
        forecasted_rate = round((forecasted / w.total_beds * 100) if w.total_beds else 0.0, 2)

        items.append(
            WardCapacityOut(
                id=w.id,
                ward_name=w.ward_name,
                ward_type=w.ward_type.value if hasattr(w.ward_type, 'value') else str(w.ward_type),
                hospital_id=w.hospital_id,
                capacity=w.capacity,
                total_beds=w.total_beds,
                occupied_beds=w.occupied_beds,
                available_beds=available,
                occupancy_rate=occ_rate,
                forecasted_occupied_24h=forecasted,
                forecasted_occupancy_rate_24h=forecasted_rate,
                risk_flag=_risk_flag(forecasted_rate),
            )
        )
    return EnvelopeResponse(data=items)
