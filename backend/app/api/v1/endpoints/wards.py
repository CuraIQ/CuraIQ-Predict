"""Ward capacity endpoints."""

import random
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import Ward
from app.schemas.ward import WardCapacityOut
from app.schemas.common import EnvelopeResponse
from app.ws.alerts import broadcast_alert

router = APIRouter(prefix="/wards", tags=["Wards"])

class BedUpdateRequest(BaseModel):
    action: str # 'add' or 'remove'
    amount: int = 1

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
async def get_ward_capacity(db: Session = Depends(get_db)):
    """Ward-level live and 24h forecasted occupancy numbers."""
    wards = db.query(Ward).all()
    items = []
    
    for w in wards:
        total = w.capacity
        occupied = w.occupied_beds
        available = total - occupied
        occ_rate = round((occupied / total * 100) if total else 0.0, 2)
        forecasted = _forecast_24h(occupied, total)
        forecasted_rate = round((forecasted / total * 100) if total else 0.0, 2)

        items.append(
            WardCapacityOut(
                id=UUID(w.id),
                ward_name=w.ward_name,
                ward_type=w.ward_type,
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

@router.post("/{ward_id}/beds", response_model=WardCapacityOut)
async def update_ward_beds(ward_id: str, req: BedUpdateRequest, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
        
    if req.action == "add":
        ward.occupied_beds = min(ward.capacity, ward.occupied_beds + req.amount)
    elif req.action == "remove":
        ward.occupied_beds = max(0, ward.occupied_beds - req.amount)
        
    db.commit()
    db.refresh(ward)
    
    # Broadcast to all clients
    await broadcast_alert({
        "type": "ward_update",
        "message": f"Ward Capacity Updated: {ward.ward_name}",
        "data": {"ward_id": ward.id, "occupied": ward.occupied_beds}
    })
    
    # Return formatted schema
    total = ward.capacity
    occupied = ward.occupied_beds
    available = total - occupied
    occ_rate = round((occupied / total * 100) if total else 0.0, 2)
    forecasted = _forecast_24h(occupied, total)
    forecasted_rate = round((forecasted / total * 100) if total else 0.0, 2)
    
    return WardCapacityOut(
        id=UUID(ward.id),
        ward_name=ward.ward_name,
        ward_type=ward.ward_type,
        hospital_id=None,
        capacity=total,
        total_beds=total,
        occupied_beds=occupied,
        available_beds=available,
        occupancy_rate=occ_rate,
        forecasted_occupied_24h=forecasted,
        forecasted_occupancy_rate_24h=forecasted_rate,
        risk_flag=_risk_flag(forecasted_rate)
    )
