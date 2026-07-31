from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import InventoryItem
from app.ws.alerts import broadcast_alert

router = APIRouter(prefix="/inventory", tags=["Inventory"])

class InventoryResponse(BaseModel):
    id: str
    name: str
    stock_level: int
    critical_threshold: int
    burn_rate_per_day: float
    forecasted_stockout_date: datetime | None

    class Config:
        from_attributes = True

class RestockRequest(BaseModel):
    amount: int

@router.get("/", response_model=List[InventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(InventoryItem).all()

@router.post("/{item_id}/restock", response_model=InventoryResponse)
async def restock_item(item_id: str, req: RestockRequest, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.stock_level += req.amount
    db.commit()
    db.refresh(item)
    
    await broadcast_alert({
        "type": "inventory_update",
        "message": f"Inventory restocked: {item.name}",
        "data": {"item_id": item.id, "new_stock": item.stock_level}
    })
    
    return item
