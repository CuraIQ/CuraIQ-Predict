from datetime import datetime
import enum
import uuid
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PredictionType(str, enum.Enum):
    BED_OVERFLOW = "bed_overflow"
    INVENTORY_STOCKOUT = "inventory_stockout"
    STAFF_SHORTAGE = "staff_shortage"
    EQUIPMENT_FAILURE = "equipment_failure"
    PATIENT_SURGE = "patient_surge"


class PredictionStatus(str, enum.Enum):
    ACTIVE = "active"
    ACCEPTED = "accepted"
    DISMISSED = "dismissed"
    OVERRIDDEN = "overridden"
    RESOLVED = "resolved"


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    prediction_type: Mapped[PredictionType] = mapped_column(SAEnum(PredictionType), nullable=False)
    ward_id: Mapped[UUID | None] = mapped_column(ForeignKey("wards.id"), nullable=True)
    item_id: Mapped[UUID | None] = mapped_column(ForeignKey("inventory_items.id"), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    forecasted_event: Mapped[str] = mapped_column(Text, nullable=False)
    target_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    recommended_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[PredictionStatus] = mapped_column(
        SAEnum(PredictionStatus), nullable=False, default=PredictionStatus.ACTIVE
    )
    action_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    actioned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint("risk_score >= 0.0 AND risk_score <= 1.0", name="ck_prediction_risk_score"),
    )
