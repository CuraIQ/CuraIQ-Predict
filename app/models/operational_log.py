from datetime import datetime
import enum
import uuid
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OperationalLog(Base):
    __tablename__ = "operational_logs"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    hospital_id: Mapped[UUID] = mapped_column(ForeignKey("hospitals.id"), nullable=False)
    ward_id: Mapped[UUID | None] = mapped_column(ForeignKey("wards.id"), nullable=True)
    metric_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
