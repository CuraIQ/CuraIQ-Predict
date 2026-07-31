"""Seed PredictIQ demo data for local development and pitch demos."""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func

from app.database import AsyncSessionLocal, engine, Base
from app.models import Hospital, Ward, Staff, InventoryItem, Prediction
from app.models.hospital import WardType
from app.models.staff import StaffRole, ShiftStatus
from app.models.prediction import PredictionType, PredictionStatus


HOSPITAL_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
WARD_IDS = {
    "icu": uuid.UUID("22222222-2222-2222-2222-222222222201"),
    "er": uuid.UUID("22222222-2222-2222-2222-222222222202"),
    "general": uuid.UUID("22222222-2222-2222-2222-222222222203"),
    "surgical": uuid.UUID("22222222-2222-2222-2222-222222222204"),
    "pediatric": uuid.UUID("22222222-2222-2222-2222-222222222205"),
}


async def seed() -> None:
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(func.count()).select_from(Hospital))
        if existing.scalar():
            print("Database already seeded — skipping.")
            return

        hospital = Hospital(
            id=HOSPITAL_ID,
            name="Metro General Hospital",
            code="MGH-001",
            address="100 Healthcare Blvd, Metro City",
        )
        session.add(hospital)

        wards = [
            Ward(
                id=WARD_IDS["icu"],
                hospital_id=HOSPITAL_ID,
                ward_name="Intensive Care Unit",
                ward_type=WardType.ICU,
                capacity=50,
                total_beds=50,
                occupied_beds=44,
            ),
            Ward(
                id=WARD_IDS["er"],
                hospital_id=HOSPITAL_ID,
                ward_name="Emergency Department",
                ward_type=WardType.EMERGENCY,
                capacity=50,
                total_beds=50,
                occupied_beds=41,
            ),
            Ward(
                id=WARD_IDS["general"],
                hospital_id=HOSPITAL_ID,
                ward_name="General Medicine",
                ward_type=WardType.GENERAL,
                capacity=250,
                total_beds=250,
                occupied_beds=218,
            ),
            Ward(
                id=WARD_IDS["surgical"],
                hospital_id=HOSPITAL_ID,
                ward_name="Surgical Ward",
                ward_type=WardType.SURGICAL,
                capacity=100,
                total_beds=100,
                occupied_beds=88,
            ),
            Ward(
                id=WARD_IDS["pediatric"],
                hospital_id=HOSPITAL_ID,
                ward_name="Pediatrics",
                ward_type=WardType.PEDIATRIC,
                capacity=50,
                total_beds=50,
                occupied_beds=36,
            ),
        ]
        session.add_all(wards)

        staff_members = []
        for i in range(1, 141):
            role = StaffRole.NURSE if i % 3 else StaffRole.DOCTOR
            status = ShiftStatus.ON_DUTY if i <= 95 else ShiftStatus.OFF_DUTY
            if i > 120:
                status = ShiftStatus.ON_BREAK if i % 2 else ShiftStatus.ON_LEAVE
            staff_members.append(
                Staff(
                    hospital_id=HOSPITAL_ID,
                    ward_id=list(WARD_IDS.values())[i % 5],
                    staff_id=f"STF-{i:04d}",
                    name=f"Staff Member {i}",
                    role=role,
                    shift_status=status,
                )
            )
        session.add_all(staff_members)

        inventory_items = [
            InventoryItem(
                hospital_id=HOSPITAL_ID,
                item_name="IV Fluids (1L Saline)",
                batch_no="IV-2026-042",
                current_stock=120,
                minimum_threshold=200,
                burn_rate_per_hour=18.5,
            ),
            InventoryItem(
                hospital_id=HOSPITAL_ID,
                item_name="Broad-Spectrum Antibiotics",
                batch_no="ABX-2026-011",
                current_stock=45,
                minimum_threshold=80,
                burn_rate_per_hour=6.2,
            ),
            InventoryItem(
                hospital_id=HOSPITAL_ID,
                item_name="ICU Sedatives",
                batch_no="SED-2026-003",
                current_stock=0,
                minimum_threshold=30,
                burn_rate_per_hour=4.1,
            ),
            InventoryItem(
                hospital_id=HOSPITAL_ID,
                item_name="Surgical Gloves (Box)",
                batch_no="GLV-2026-099",
                current_stock=340,
                minimum_threshold=150,
                burn_rate_per_hour=2.0,
            ),
            InventoryItem(
                hospital_id=HOSPITAL_ID,
                item_name="Cardiac Monitoring Supplies",
                batch_no="CAR-2026-017",
                current_stock=22,
                minimum_threshold=40,
                burn_rate_per_hour=1.5,
            ),
        ]
        session.add_all(inventory_items)
        await session.flush()

        now = datetime.now(timezone.utc)
        predictions = [
            Prediction(
                prediction_type=PredictionType.BED_OVERFLOW,
                ward_id=WARD_IDS["general"],
                risk_score=0.94,
                forecasted_event="General Ward projected at 96% capacity within 4 hours",
                target_timestamp=now + timedelta(hours=4),
                recommended_action="Trigger Ward B reserve bed allocation and early discharge protocol",
                status=PredictionStatus.ACTIVE,
            ),
            Prediction(
                prediction_type=PredictionType.INVENTORY_STOCKOUT,
                item_id=inventory_items[0].id,
                risk_score=0.91,
                forecasted_event="IV Fluids stock projected to deplete in 1.8 days",
                target_timestamp=now + timedelta(days=2),
                recommended_action="Initiate emergency stock reorder for IV Fluids",
                status=PredictionStatus.ACTIVE,
            ),
            Prediction(
                prediction_type=PredictionType.STAFF_SHORTAGE,
                ward_id=WARD_IDS["icu"],
                risk_score=0.78,
                forecasted_event="ICU night shift understaffed by 3 nurses in 6 hours",
                target_timestamp=now + timedelta(hours=6),
                recommended_action="Call in on-call nursing pool and reassign 2 float nurses",
                status=PredictionStatus.ACTIVE,
            ),
            Prediction(
                prediction_type=PredictionType.PATIENT_SURGE,
                ward_id=WARD_IDS["er"],
                risk_score=0.72,
                forecasted_event="ER arrival surge expected (+35%) between 20:00–02:00",
                target_timestamp=now + timedelta(hours=3),
                recommended_action="Activate surge tent protocol and pre-position triage staff",
                status=PredictionStatus.ACTIVE,
            ),
            Prediction(
                prediction_type=PredictionType.INVENTORY_STOCKOUT,
                item_id=inventory_items[2].id,
                risk_score=0.97,
                forecasted_event="ICU Sedatives at zero stock — immediate replenishment required",
                target_timestamp=now + timedelta(hours=1),
                recommended_action="Emergency pharmacy transfer from central supply",
                status=PredictionStatus.ACTIVE,
            ),
            Prediction(
                prediction_type=PredictionType.EQUIPMENT_FAILURE,
                ward_id=WARD_IDS["surgical"],
                risk_score=0.55,
                forecasted_event="Ventilator #7 showing elevated fault indicators",
                target_timestamp=now + timedelta(hours=12),
                recommended_action="Schedule preventive maintenance and deploy backup unit",
                status=PredictionStatus.ACTIVE,
            ),
        ]
        session.add_all(predictions)

        await session.commit()
        print(f"Seeded demo data: 1 hospital, {len(wards)} wards, {len(staff_members)} staff, "
              f"{len(inventory_items)} inventory items, {len(predictions)} active predictions.")


if __name__ == "__main__":
    asyncio.run(seed())
