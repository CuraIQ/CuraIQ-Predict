from datetime import datetime, timezone
import uuid

# In-memory storage to replace PostgreSQL
db = {
    "wards": [
        {"id": str(uuid.uuid4()), "name": "Emergency", "total_beds": 30, "occupied_beds": 25, "status": "critical"},
        {"id": str(uuid.uuid4()), "name": "ICU", "total_beds": 20, "occupied_beds": 18, "status": "high"},
        {"id": str(uuid.uuid4()), "name": "General", "total_beds": 50, "occupied_beds": 32, "status": "normal"},
    ],
    "predictions": [
        {
            "id": str(uuid.uuid4()),
            "prediction_type": "bed_shortage",
            "risk_score": 0.85,
            "forecasted_event": "ER bed shortage in 2 hours",
            "recommended_action": "Divert non-critical patients",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "target_ward_id": None
        }
    ],
    "telemetry": [],
    "staff": {
        "total_staff": 120,
        "on_duty": 45,
        "off_duty": 60,
        "on_break": 10,
        "on_leave": 5
    },
    "inventory": {
        "total_items": 500,
        "items_below_threshold": 12,
        "critical_items": 3
    }
}
