from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ward
from app.ws.alerts import broadcast_alert

router = APIRouter(prefix="/surge", tags=["Surge Simulation"])

@router.post("/trigger")
async def trigger_surge(db: Session = Depends(get_db)):
    # Update all ER and ICU wards to critical
    er_icu_wards = db.query(Ward).filter(Ward.ward_type.in_(["er", "icu"])).all()
    
    for ward in er_icu_wards:
        ward.occupied_beds = int(ward.capacity * 0.95)
        ward.status = "critical"
        
    db.commit()

    await broadcast_alert({
        "type": "surge_alert",
        "message": "EMERGENCY SURGE DETECTED: Mass casualty incident protocol activated.",
        "risk_level": "critical"
    })
    
    return {"status": "Surge triggered"}
