from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    employee_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # In a real app, hash this!
    role = Column(String) # 'nurse', 'doctor', 'pharmacist', 'admin'
    department = Column(String)
    status = Column(String, default="pending_approval") # 'active', 'pending_approval'

class Ward(Base):
    __tablename__ = "wards"

    id = Column(String, primary_key=True, default=generate_uuid)
    ward_name = Column(String)
    ward_type = Column(String) # 'er', 'icu', 'general', 'pediatric', 'surgical'
    capacity = Column(Integer)
    occupied_beds = Column(Integer, default=0)
    status = Column(String, default="normal") # 'normal', 'high', 'critical'

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True)
    stock_level = Column(Integer, default=0)
    critical_threshold = Column(Integer, default=10)
    burn_rate_per_day = Column(Float, default=1.0)
    forecasted_stockout_date = Column(DateTime, nullable=True)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=generate_uuid)
    prediction_type = Column(String)
    target_ward_id = Column(String, nullable=True)
    target_item_id = Column(String, nullable=True)
    risk_score = Column(Float)
    risk_level = Column(String)
    forecasted_event = Column(String)
    target_timestamp = Column(DateTime, nullable=True)
    recommended_action = Column(String)
    status = Column(String, default="active") # 'active', 'accepted', 'dismissed', 'overridden'
    created_at = Column(DateTime, server_default=func.now())
