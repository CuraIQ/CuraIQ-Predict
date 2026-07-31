import os
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, Ward, InventoryItem, Prediction
from app.config import settings

def seed_database():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(User).first():
        db.close()
        return

    # Seed Users
    users = [
        User(name="Admin Alice", employee_id="ADM-001", email="admin@curaiq.com", password="password123", role="admin", department="Administration", status="active"),
        User(name="Dr. Bob ER", employee_id="DOC-ER1", email="er_doc@curaiq.com", password="password123", role="doctor", department="Emergency", status="active"),
        User(name="Nurse Carol ER", employee_id="NRS-ER1", email="er_nurse@curaiq.com", password="password123", role="nurse", department="Emergency", status="active"),
        User(name="Nurse Dave Ward", employee_id="NRS-W1", email="ward_nurse@curaiq.com", password="password123", role="nurse", department="General", status="active"),
        User(name="Pharm. Eve", employee_id="PHM-001", email="pharmacy@curaiq.com", password="password123", role="pharmacist", department="Pharmacy", status="active"),
    ]
    db.add_all(users)

    # Seed Wards
    wards = [
        Ward(ward_name="Emergency Department", ward_type="er", capacity=50, occupied_beds=42, status="amber"),
        Ward(ward_name="Intensive Care Unit", ward_type="icu", capacity=30, occupied_beds=28, status="red"),
        Ward(ward_name="General Medicine", ward_type="general", capacity=150, occupied_beds=110, status="green"),
        Ward(ward_name="Pediatrics", ward_type="pediatric", capacity=40, occupied_beds=20, status="green"),
        Ward(ward_name="Surgical Ward", ward_type="surgical", capacity=80, occupied_beds=60, status="green"),
    ]
    db.add_all(wards)

    # Seed Inventory
    now = datetime.now(timezone.utc)
    inventory = [
        InventoryItem(name="IV Fluids (Saline)", stock_level=120, critical_threshold=200, burn_rate_per_day=40.0, forecasted_stockout_date=now + timedelta(days=3)),
        InventoryItem(name="Epinephrine Auto-Injectors", stock_level=5, critical_threshold=20, burn_rate_per_day=2.0, forecasted_stockout_date=now + timedelta(days=2.5)),
        InventoryItem(name="Surgical Masks (N95)", stock_level=1500, critical_threshold=500, burn_rate_per_day=150.0, forecasted_stockout_date=now + timedelta(days=10)),
        InventoryItem(name="Propofol (Sedative)", stock_level=2, critical_threshold=50, burn_rate_per_day=5.0, forecasted_stockout_date=now + timedelta(hours=10)),
    ]
    db.add_all(inventory)

    # Seed Predictions
    predictions = [
        Prediction(prediction_type="bed_overflow", risk_score=0.92, risk_level="critical", forecasted_event="ICU at 100% capacity within 2 hours", recommended_action="Initiate early discharge for stable patients", target_timestamp=now + timedelta(hours=2)),
        Prediction(prediction_type="inventory_stockout", risk_score=0.88, risk_level="critical", forecasted_event="Propofol depletion", recommended_action="Emergency restock from central pharmacy", target_timestamp=now + timedelta(hours=10)),
    ]
    db.add_all(predictions)

    db.commit()

    # Generate credentials.txt
    cred_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "credentials.txt")
    with open(cred_path, "w") as f:
        f.write("PredictIQ Default Credentials\\n\\n")
        for u in users:
            f.write(f"Role: {u.role.capitalize()}\\n")
            f.write(f"Name: {u.name} ({u.department})\\n")
            f.write(f"Email: {u.email}\\n")
            f.write(f"Password: {u.password}\\n")
            f.write("-" * 30 + "\\n")
            
    db.close()
